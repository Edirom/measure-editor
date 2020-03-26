import {Segment} from '@/data/Segment';
import {StoreType} from '@/store/StoreType';
import {ActionContext, ActionTree, GetterTree, MutationTree} from 'vuex';
import {NoopRemoteState, RemoteState} from '@/store/RemoteState';
import {StateMutator} from '@/store/StateMutator';
import {RootState} from '@/store/index';

interface SheetSegment {
    segment: Segment;
    sheetId: string;
}

export class SegmentStore implements StoreType<RootState> {
    public getters: GetterTree<RootState, RootState> = {
        segments(state): { [id: string]: Segment } {
            return state._segments;
        },
    };
    public mutations: MutationTree<RootState> = {
        addSegmentToSheet(state: RootState, data: SheetSegment) {
            if (Object.hasOwnProperty.call(state._sheets, data.sheetId)) {
                StateMutator.stateAdd<Segment>(state._segments, data.segment.id, data.segment);
                state._sheets[data.sheetId].segments =
                    state._sheets[data.sheetId].segments.slice().concat([data.segment.id]);
            }
        },
        removeSegmentFromSheet(state: RootState, data: SheetSegment) {
            if (Object.hasOwnProperty.call(state._sheets, data.sheetId)) {
                StateMutator.removeFromArray(state._sheets[data.sheetId].segments,
                    (s: string) => s === data.segment.id);
                state._sheets[data.sheetId].mutate();
                StateMutator.stateDelete<Segment>(state._segments, data.segment.id);
            }
        },
        updateSegment(state: RootState, segment: Segment) {
            StateMutator.stateDelete<Segment>(state._segments, segment.id);
            StateMutator.stateAdd<Segment>(state._segments, segment.id, segment);
            // TODO: find the affected sheet and mark it as dirty
        },
    };
    public actions: ActionTree<RootState, RootState> = {
        addSegmentToSheet: (ctx: ActionContext<RootState, RootState>, data: SheetSegment) => {
            return new Promise<Segment>((resolve, reject) => {
                data.segment.sheetId = data.sheetId;
                this.remoteState.create(data.segment).then((newSegment: Segment) => {
                    ctx.commit('addSegmentToSheet', {
                        segment: newSegment,
                        sheetId: data.sheetId,
                    });
                    resolve(newSegment);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        removeSegmentFromSheet: (ctx: ActionContext<RootState, RootState>, data: SheetSegment) => {
            return new Promise<Segment>((resolve, reject) => {
                this.remoteState.delete(data.segment).then(() => {
                    ctx.commit('removeSegmentFromSheet', data);
                    resolve(data.segment);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        updateSegment: (ctx: ActionContext<RootState, RootState>, segment: Segment) => {
            return new Promise<Segment>((resolve, reject) => {
                this.remoteState.update(segment).then((updatedSegment: Segment) => {
                    ctx.commit('updateSegment', updatedSegment);
                    resolve(updatedSegment);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
    };
    private readonly remoteState: RemoteState<Segment>;
    constructor(remoteState?: RemoteState<Segment>) {
        if (!remoteState) {
            this.remoteState = new NoopRemoteState<Segment>();
        } else {
            this.remoteState = remoteState;
        }
    }
}
