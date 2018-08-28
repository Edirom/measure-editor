import {RootState} from '@/store';
import {StoreType} from '@/store/StoreType';
import {Measure} from '@/data/Measure';
import {StateMutator} from '@/store/StateMutator';
import {RemoteMeasureState} from '@/store/RemoteState';
import {ActionContext} from 'vuex';
import {MeasureOnSheet} from '@/types';
import {generateUUID} from '@/data/utils';
import {Extents, Measure as MEIMeasure, Zone} from '@/MEI/data';

const extentsFromMeasure = (points: Array<{x: number, y: number}>, relativeTo: {width: number, height: number}) => {
    let maxX = -1;
    let maxY = -1;
    let minX = Infinity;
    let minY = Infinity;
    for (const point of points) {
        if (maxX < point.x) {
            maxX = point.x;
        }
        if (minX > point.x) {
            minX = point.x;
        }
        if (maxY < point.y) {
            maxY = point.y;
        }
        if (minY > point.y) {
            minY = point.y;
        }
    }
    const scaleX = relativeTo.width / 100;
    const scaleY = relativeTo.height / 100;
    return new Extents(
        Math.round(minX * scaleX),
        Math.round(minY * scaleY),
        Math.round(maxX * scaleX),
        Math.round(maxY * scaleY),
    );
};

const addMEIMeasureToSheet = (state: RootState, data: MeasureOnSheet) => {
    const mei = state._sheets[data.sheetId].parentMEI;
    if (mei && mei.music && mei.music.facsimile &&
        mei.music.body && mei.music.body.mdivs.length > 0 &&
        mei.music.body.mdivs[0].scores.length > 0 &&
        mei.music.body.mdivs[0].scores[0].sections.length > 0) {
        const surface = mei.music.facsimile.surfaces[data.page];
        const graphic = surface.graphic;
        if (!graphic) {
            // in theory we could fall back to the surface's extents (if available), but it is not clear how
            // coordinate systems are defined and we rely on the graphic's size anyway
            console.warn('Surface has no graphic to go on');
            return;
        }
        const zone = new Zone('zone_' + generateUUID(), extentsFromMeasure(data.measure.geometry.points, graphic));
        const meiMeasure = new MEIMeasure('measure_' + generateUUID(),
            data.measure.name, data.measure.name, '#' + zone.id);
        surface.addZone(zone);
        zone.measures.push(meiMeasure);
        // TODO: figure out the section - for now we will just assume the first
        const section = mei.music.body.mdivs[0].scores[0].sections[0];
        section.addMeasure(meiMeasure);
    }
};

const removeMEIMeasureFromSheet = (state: RootState, data: MeasureOnSheet) => {
    const sheet = state._sheets[data.sheetId];
    let found = false;
    if (sheet.parentMEI && sheet.parentMEI.music) {
        if (sheet.parentMEI.music.body) {
            for (const mdiv of sheet.parentMEI.music.body.mdivs) {
                for (const score of mdiv.scores) {
                    for (const section of score.sections) {
                        if (section.removeMeasure(data.measure.id)) {
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
        }
        if (sheet.parentMEI.music.facsimile) {
            for (const surface of sheet.parentMEI.music.facsimile.surfaces) {
                for (const zone of surface.zones) {
                    const index = zone.measures.findIndex((m) => m.id === data.measure.id);
                    if (index > -1) {
                        zone.measures.splice(index, 1);
                        if (zone.measures.length === 0) {
                            surface.removeZone(zone.id);
                        }
                        return;
                    }
                }
            }
        }
    }
    if (!found) {
        console.warn('Tried to delete a measure but was not able to', {data, sheet});
    }
};

const updateMEIMeasure = (state: RootState, measure: Measure) => {
    // since we have no indication here on which sheet the measure actually resides we have to iterate
    // over all of them
    for (const sheetId in state._sheets) {
        if (state._sheets.hasOwnProperty(sheetId)) {
            const mei = state._sheets[sheetId].parentMEI;
            // we have to update both zone and measure. The zone knows the measures it is linked by,
            // so we better iterate via the zones
            if (mei && mei.music && mei.music.facsimile) {
                for (const surface of mei.music.facsimile.surfaces) {
                    if (!surface.graphic) {
                        console.warn('Cannot update measure without graphic');
                        return;
                    }
                    for (const zone of surface.zones) {
                        const foundMeasure = zone.measures.find((m) => m.id === measure.id);
                        if (foundMeasure) {
                            foundMeasure.label = measure.name;
                            zone.extents = extentsFromMeasure(measure.geometry.points, surface.graphic);
                            return;
                        }
                    }
                }
            }
        }
    }
    console.warn('Tried to update a measure that does not exist', {measure});
};


export class MeasureStore implements StoreType<RootState> {
    public getters = {
        measuresById(state: RootState): (ids: number[]) => Measure[] {
            return (ids: number[]) => {
                const foundMeasures: Measure[] = [];
                for (const id of ids) {
                    if (state._measures.hasOwnProperty(id)) {
                        foundMeasures.push(state._measures[id]);
                    }
                }
                return foundMeasures;
            };
        },
        measuresOnPage(state: RootState, getters: any):
            (sheetId: number, page: number) => Measure[] {
            return (sheetId: number, page: number) => {
                if (state._sheets.hasOwnProperty(sheetId) && state._sheets[sheetId].images.length > page) {
                    const pageId = state._sheets[sheetId].images[page];
                    if (state._images.hasOwnProperty(pageId)) {
                        return getters.measuresById(state._images[pageId].measures);
                    }
                }
                return [];
            };
        },
    };
    public mutations = {
        addMeasureToSheet: this.addMeasureToSheet,
        removeMeasureFromSheet: this.removeMeasureFromSheet,
        updateMeasure: (state: RootState, m: Measure) => {
            updateMEIMeasure(state, m);
            StateMutator.stateDelete(state._measures, m.id);
            StateMutator.stateAdd(state._measures, m.id, m);
        },
    };
    public actions = {
        // splitMeasure: (ctx: ActionContext<RootState, RootState>, data: MeasureSplit) => {
        //     // TODO: sanity checking of data
        //     const newMeasures = this.splitMeasure(data);
        //     const splitMeasureNumber = parseInt(data.measure.name, 10);
        //     if (!isNaN(splitMeasureNumber)) {
        //         // TODO: which of those is the 'first' one?
        //         let found = false;
        //         // the split measure's name is a number. try to detect any higher numbers on this sheet
        //         for (const imageId of ctx.state._sheets[data.sheetId].images) {
        //             const image = ctx.state._images[imageId];
        //             for (const measureId of image.measures) {
        //                 const measure = ctx.state._measures[measureId];
        //                 const measureNumber = parseInt(measure.name, 10);
        //                 if (!isNaN(measureNumber)) {
        //                     if (measureNumber > splitMeasureNumber) {
        //                         found = true;
        //                         break;
        //                     }
        //                 }
        //             }
        //             if (found) {
        //                 break;
        //             }
        //         }
        //         if (!found) {
        //             newMeasures[0].name = splitMeasureNumber + '';
        //             newMeasures[1].name = (splitMeasureNumber + 1) + '';
        //         }
        //     }
        //     const mutationData = [
        //         {
        //             measure: newMeasures[0],
        //             sheetId: data.sheetId,
        //             page: data.page,
        //             imageId: data.imageId,
        //         },
        //         {
        //             measure: newMeasures[1],
        //             sheetId: data.sheetId,
        //             page: data.page,
        //             imageId: data.imageId,
        //         },
        //         {
        //             measure: data.measure,
        //             sheetId: data.sheetId,
        //             page: data.page,
        //             imageId: data.imageId,
        //         },
        //     ];
        //     Promise.all([
        //         this.remoteAddMeasureToSheet(mutationData[0]),
        //         this.remoteAddMeasureToSheet(mutationData[1]),
        //         this.remoteRemoveMeasureFromSheet(mutationData[2])]).then((measures) => {
        //             mutationData[0].measure = measures[0];
        //             mutationData[1].measure = measures[1];
        //             mutationData[2].measure = measures[2];
        //             ctx.commit('addMeasureToSheet', mutationData[0]);
        //             ctx.commit('addMeasureToSheet', mutationData[1]);
        //             ctx.commit('removeMeasureFromSheet', mutationData[2]);
        //     }).catch((error) => {
        //         // TODO: Error handling
        //     });
        // },
        addMeasureToSheet: (ctx: ActionContext<RootState, RootState>, data: MeasureOnSheet) => {
            this.remoteAddMeasureToSheet(data).then((m) => {
                data.measure = m;
                ctx.commit('addMeasureToSheet', data);
            }).catch((error) => {
                // TODO: error handling
                console.error({error});
            });
        },
        removeMeasureFromSheet: (ctx: ActionContext<RootState, RootState>, data: MeasureOnSheet) => {
            this.remoteRemoveMeasureFromSheet(data).then(() => {
                ctx.commit('removeMeasureFromSheet', data);
            }).catch((error) => {
                // TODO: error handling
                console.error({error});
            });
        },
        updateMeasure: (ctx: ActionContext<RootState, RootState>, m: Measure) => {
            this.remoteState.update(m).then((updatedMeasure) => {
                ctx.commit('updateMeasure', updatedMeasure);
            }).catch((error) => {
                // TODO: error handling
                console.error({error});
            });
        },
    };
    private readonly remoteState: RemoteMeasureState;
    constructor(remoteState?: RemoteMeasureState) {
        if (remoteState) {
            this.remoteState = remoteState;
        } else {
            this.remoteState = {
                create: ((measure, imageId) => {
                    measure.id = 'measure_' + generateUUID();
                    return Promise.resolve(measure);
                }),
                delete: ((measure) => {
                    return Promise.resolve(measure);
                }),
                update: ((measure) => {
                    return Promise.resolve(measure);
                }),
                getForImage: (imageId: string): Promise<Measure[]> => {
                    return Promise.resolve([]);
                },
            };
        }
    }

    private addMeasureToSheet(state: RootState, data: MeasureOnSheet) {
        if (state._sheets.hasOwnProperty(data.sheetId)
            && state._sheets[data.sheetId].images.length > data.page
            && data.measure.id) {
            // TODO: this is backend specific and should be removed as soon as the bootstrapping is solved
            if (data.measure.segmentId && state._segments.hasOwnProperty(data.measure.segmentId)) {
                data.measure.segment = state._segments[data.measure.segmentId];
            }
            const imageIndex = state._sheets[data.sheetId].images[data.page];
            StateMutator.stateAdd<Measure>(state._measures, data.measure.id, data.measure);
            if (!data.skipMei) {
                addMEIMeasureToSheet(state, data);
            }
            state._images[imageIndex].measures.push(data.measure.id);
            state._images[imageIndex].mutate();
            state._sheets[data.sheetId].mutate();
        } else {
            const sheet = state._sheets[data.sheetId];
            if (!sheet) {
                console.warn('No sheet', data.sheetId);
            } else if (sheet.images.length <= data.page) {
                console.warn('No such page on', data.sheetId, sheet.images.length, data.page);
            } else if (!data.measure.id) {
                console.warn('Measure has no ID');
            }
        }
    }

    private removeMeasureFromSheet(state: RootState, data: MeasureOnSheet) {
        if (state._sheets.hasOwnProperty(data.sheetId) && state._sheets[data.sheetId].images.length > data.page) {
            removeMEIMeasureFromSheet(state, data);
            const imageIndex = state._sheets[data.sheetId].images[data.page];
            StateMutator.stateDelete<Measure>(state._measures, data.measure.id);
            StateMutator.removeFromArray<string>(state._images[imageIndex].measures,
                (m: string) => m === data.measure.id);
            state._images[imageIndex].mutate();
            state._sheets[data.sheetId].mutate();
        }
    }
    private remoteAddMeasureToSheet(data: MeasureOnSheet): Promise<Measure> {
        return this.remoteState.create(data.measure, data.imageId);
    }
    private remoteRemoveMeasureFromSheet(data: MeasureOnSheet): Promise<Measure> {
        return this.remoteState.delete(data.measure);
    }
    // private splitMeasure(data: MeasureSplit): [Measure, Measure] {
    //     // construct two new measures from the information provided
    //     const pointsBeforeSplit: Vector2[] = [];
    //     const pointsAfterSplit: Vector2[] = [];
    //     const points = data.measure.geometry.points;
    //     // 0 = before finding first point split,
    //     // 1 = between first and second point split,
    //     // 2 = after second point split
    //     let splitState = 0;
    //     for (let i = 0; i < points.length; i++) {
    //         const firstVertex = points[i];
    //         const secondVertex = points[(i + 1) % points.length];
    //         if (splitState !== 1) {
    //             pointsBeforeSplit.push(firstVertex);
    //         } else {
    //             pointsAfterSplit.push(firstVertex);
    //         }
    //         if (splitState < 2) {
    //             const edgeLength = Math.sqrt(firstVertex.sqrDistance(secondVertex));
    //             const distanceToFirstPoint = Math.sqrt(firstVertex.sqrDistance(
    //                 data.collisionPoints[splitState]));
    //             const distanceToSecondPoint = Math.sqrt(secondVertex.sqrDistance(
    //                 data.collisionPoints[splitState]));
    //             if (Math.abs(edgeLength - (distanceToFirstPoint + distanceToSecondPoint))
    //                 < Number.EPSILON) {
    //                 // we clone the collision points here to break any references between the two entities
    //                 // otherwise if you move one the other would have the points still attached but
    //                 // does not move with it
    //                 // also this ensures that all points are marked as non-transient
    //                 const beforePoint = new Vector2(data.collisionPoints[splitState].x,
    //                     data.collisionPoints[splitState].y);
    //                 const afterPoint = new Vector2(data.collisionPoints[splitState].x,
    //                     data.collisionPoints[splitState].y);
    //                 pointsBeforeSplit.push(beforePoint);
    //                 pointsAfterSplit.push(afterPoint);
    //                 splitState++;
    //             }
    //         }
    //     }
    //     const beforeMeasure = new Measure(
    //         data.measure.name + 'a',
    //         {
    //             points: pointsBeforeSplit,
    //         },
    //         data.measure.segment,
    //     );
    //     const afterMeasure = new Measure(
    //         data.measure.name + 'b',
    //         {
    //             points: pointsAfterSplit,
    //         },
    //         data.measure.segment,
    //     );
    //     return [beforeMeasure, afterMeasure];
    // }
}
