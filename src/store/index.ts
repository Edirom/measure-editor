import Vuex, {ActionContext, ActionTree, GetterTree, MutationTree, Store} from 'vuex';
import Vue from 'vue';
import {AudioRecording} from '@/data/AudioRecording';
import {TextSource} from '@/data/TextSource';
import {WorkSource} from '@/types';
import {Measure} from '@/data/Measure';
import {StoreImage, StoreSheet, StoreWork} from '@/data/store';
import {Instrument} from '@/data/Instrument';
import {MeasureStore} from '@/store/MeasureStore';
import {WorkStore} from '@/store/WorkStore';
import {StoreType} from '@/store/StoreType';
import {SheetStore} from '@/store/SheetStore';
import {Segment} from '@/data/Segment';
import {SegmentStore} from '@/store/SegmentStore';
import {ImageStore} from '@/store/ImageStore';
import {MEIParser} from '@/MEI';
import {Sheet} from '@/data/Sheet';
import {Image} from '@/data/Image';
import {Vector2} from '@/data/geometry/Vector2';

Vue.use(Vuex);

export enum Mutations {
    ADD_WORK = 'addWork',
    DELETE_WORK = 'deleteWork',
    ADD_TEXT = 'addText',
    DELETE_TEXT = 'deleteText',
    ADD_RECORDING = 'addRecording',
    DELETE_RECORDING = 'deleteRecording',
    ADD_IMAGE = 'addImage',
    DELETE_IMAGE = 'deleteImage',
    ADD_SHEET = 'addSheet',
    DELETE_SHEET = 'deleteSheet',
    ADD_SOURCE_TO_WORK = 'addSourceToWork',
    DELETE_SOURCE_FROM_WORK = 'deleteSourceFromWork',
    ADD_MEASURE_TO_SHEET = 'addMeasureToSheet',
    REMOVE_MEASURE_FROM_SHEET = 'removeMeasureFromSheet',
    SPLIT_MEASURE = 'splitMeasure',
    ADD_IMAGE_TO_SHEET = 'addImageToSheet',
    REMOVE_IMAGE_FROM_SHEET = 'removeImageFromSheet',
    ADD_SEGMENT_TO_SHEET = 'addSegmentToSheet',
    REMOVE_SEGMENT_FROM_SHEET = 'removeSegmentFromSheet',
    UPDATE_SEGMENT = 'updateSegment',
}

export interface RootState {
    _sheets: { [id: string]: StoreSheet };
    _images: { [id: string]: StoreImage };
    _works: { [id: string]: StoreWork };
    _measures: { [id: string]: Measure };
    _segments: { [id: string]: Segment };
    _texts: { [id: string]: TextSource };
    _recordings: { [id: string]: AudioRecording };
    headline: string;
    currentEntity: string;
}

const dataStores: Array<StoreType<RootState>> = [
    new MeasureStore(),
    new ImageStore(),
    new SheetStore(),
    new SegmentStore(),
];

const getters: GetterTree<RootState, RootState> = dataStores.reduce((acc, store) => {
    return Object.assign(acc, store.getters);
}, {});
const mutations: MutationTree<RootState> = dataStores.reduce((acc, store) => {
    return Object.assign(acc, store.mutations);
}, {
    // global state for headline
    setHeadline(state: RootState, headline: string) {
        state.headline = headline;
    },
    setCurrentEntity(state: RootState, currentEntity: string) {
        state.currentEntity = currentEntity;
    },
});
const actions: ActionTree<RootState, RootState> = dataStores.reduce((acc, store) => {
    return Object.assign(acc, store.actions);
}, {
    addSourceToWork(ctx: ActionContext<RootState, RootState>, data: WorkSource) {
        if (!ctx.state._works.hasOwnProperty(data.workId)) {
            return new Promise((resolve, reject) => reject(new Error('Cannot find work with id ' + data.workId)));
        }
        switch (data.source.type) {
            case 'sheet':
                return ctx.dispatch('addSheetToWork', data);
            case 'image':
                return ctx.dispatch('addImageToWork', data);
            case 'audio':
                return ctx.dispatch('addRecordingToWork', data);
            case 'text':
                return ctx.dispatch('addTextToWork', data);
            default:
                throw new Error('addSourceToWork has no handler for ' + data.source.type);
        }
    },
    removeSourceFromWork(ctx: ActionContext<RootState, RootState>, data: WorkSource) {
        if (!ctx.state._works.hasOwnProperty(data.workId)) {
            return;
        }
        switch (data.source.type) {
            case 'sheet':
                return ctx.dispatch('removeSheetFromWork', data);
            case 'image':
                return ctx.dispatch('removeImageFromWork', data);
            case 'audio':
                return ctx.dispatch('removeRecordingFromWork', data);
            case 'text':
                return ctx.dispatch('removeTextFromWork', data);
            default:
                throw new Error('deleteSourceFromWork has no handler for ' + data.source.type);
        }
    },
    fetchMEIFromURL(ctx: ActionContext<RootState, RootState>, url: string) {
        return new Promise((resolve, reject) => {
            fetch(url).then((response) => {
                response.text().then((text) => {
                    const splitBySlash = url.split('/');
                    const sheetName = splitBySlash[splitBySlash.length - 1].split('.xml', 1)[0];
                    ctx.dispatch ('loadMEI', {text, sheetName}).then((value) => {
                        resolve(value);
                    }).catch((reason) => {
                        reject(reason);
                    });
                }).catch((reason) => {
                    reject(reason);
                });
            }).catch((reason) => {
                reject(reason);
            });
        });
    },
    loadMEI(ctx: ActionContext<RootState, RootState>, data: {text: string, sheetName: string}) {
        return new Promise((resolve) => {
            const mei = MEIParser.parse(data.text);
            if (mei.music && mei.music.facsimile) {
                const s = new Sheet(data.sheetName, data.sheetName, '');
                s.parentMEI = mei;
                ctx.commit(Mutations.ADD_SHEET, s);
                let page = 0;
                for (const surface of mei.music.facsimile.surfaces) {
                    // these correspond to the pages of a sheet
                    if (surface.graphic) {
                        const storedImages = ctx.getters.images;
                        const imageId = surface.graphic.id || surface.graphic.target;
                        let image: Image;
                        if (!storedImages.hasOwnProperty(imageId)) {
                            // see if the target looks like a URL, and if so directly load it
                            const imagepath =
                                (surface.graphic.target.indexOf('://') > -1 || surface.graphic.target.startsWith('/'))
                                ? surface.graphic.target : '';
                            image = new Image(
                                imageId,
                                surface.graphic.target,
                                imagepath,
                                surface.graphic.width,
                                surface.graphic.height,
                            );
                            ctx.commit(Mutations.ADD_IMAGE, image);
                        } else {
                            image = storedImages[imageId];
                        }
                        ctx.commit(Mutations.ADD_IMAGE_TO_SHEET, {
                            image,
                            sheetId: s.id,
                        });
                        for (const zone of surface.zones) {
                            for (const measure of zone.measures) {
                                const m = new Measure(measure.label, {
                                    points: zone.extents.toPolygon().map((p) => {
                                        return {
                                            x: p.x * 100 / image.width,
                                            y: p.y * 100 / image.height,
                                        };
                                    }),
                                });
                                m.id = measure.id;
                                ctx.commit(Mutations.ADD_MEASURE_TO_SHEET, {
                                    sheetId: s.id,
                                    page,
                                    imageId: surface.graphic.id,
                                    measure: m,
                                    skipMei: true,
                                });
                            }
                        }
                    }
                    page++;
                }
            }
            resolve();
        });
    },
});

const storeInstance = new Store<RootState>({
    state: {
        _sheets: {},
        _images: {},
        _works: {},
        _measures: {},
        _segments: {},
        _texts: {},
        _recordings: {},
        headline: 'Bibliothek',
        currentEntity: '',
    },
    getters,
    mutations,
    actions,
});
const dummy = async () => {
    await storeInstance.dispatch('fetchMEIFromURL', '/data/an-die-ferne-geliebte.xml');
    await storeInstance.dispatch('fetchMEIFromURL', '/data/moellersche-handschrift.xml');
    await storeInstance.dispatch('fetchMEIFromURL', '/data/Op.111_A.xml');
};
dummy().catch((error) => console.error({error}));
export default storeInstance;
