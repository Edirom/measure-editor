import {Sheet} from '@/data/Sheet';
import {StoreType} from '@/store/StoreType';
import {ActionContext, ActionTree, GetterTree, MutationTree} from 'vuex';
import {NoopRemoteState, RemoteSourceState} from '@/store/RemoteState';
import {StoreSheet} from '@/data/store';
import {StateMutator} from '@/store/StateMutator';
import {RootState} from '@/store/index';
import {WorkSource} from '@/types';

export class SheetStore implements StoreType<RootState> {
    public getters: GetterTree<RootState, RootState> = {
        sheets(state): { [id: number]: Sheet } {
            const converted: { [id: string]: Sheet } = {};
            for (const id in state._sheets) {
                if (Object.hasOwnProperty.call(state._sheets, id)) {
                    converted[id] = StoreSheet.createSheet(state._sheets[id], state);
                }
            }
            return converted;
        },
        sheetsById(state): (ids: number[]) => StoreSheet[] {
            return (ids: number[]) => {
                const foundSheets: StoreSheet[] = [];
                for (const id of ids) {
                    if (Object.hasOwnProperty.call(state._sheets, id)) {
                        foundSheets.push(state._sheets[id]);
                    }
                }
                return foundSheets;
            };
        },
    };
    public mutations: MutationTree<RootState> = {
        addSheet(state: RootState, sheet: Sheet) {
            StateMutator.stateAdd<StoreSheet>(state._sheets, sheet.id, new StoreSheet(sheet));
        },
        deleteSheet(state: RootState, sheet: Sheet) {
            StateMutator.stateDelete<StoreSheet>(state._sheets, sheet.id);
        },
        modifySheet(state: RootState, sheet: Sheet) {
            StateMutator.stateDelete<StoreSheet>(state._sheets, sheet.id);
            StateMutator.stateAdd<StoreSheet>(state._sheets, sheet.id, new StoreSheet(sheet));
        },
    };
    public actions: ActionTree<RootState, RootState> = {
        addSheet: (ctx: ActionContext<RootState, RootState>, sheet: Sheet) => {
            return new Promise<Sheet>((resolve, reject) => {
                this.remoteState.create(sheet).then((newSheet: Sheet) => {
                    ctx.commit('addSheet', newSheet);
                    resolve(newSheet);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        deleteSheet: (ctx: ActionContext<RootState, RootState>, sheet: Sheet) => {
            return new Promise<Sheet>((resolve, reject) => {
                this.remoteState.delete(sheet).then((newSheet: Sheet) => {
                    ctx.commit('deleteSheet', newSheet);
                    resolve(newSheet);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        modifySheet: (ctx: ActionContext<RootState, RootState>, sheet: Sheet) => {
            return new Promise<Sheet>((resolve, reject) => {
                this.remoteState.update(sheet).then((updatedSheet: Sheet) => {
                    ctx.commit('modifySheet', updatedSheet);
                    resolve(updatedSheet);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        addSheetToWork: (ctx: ActionContext<RootState, RootState>, data: WorkSource) => {
            return new Promise<Sheet>((resolve, reject) => {
                this.remoteState.attachToWork((data.source as Sheet), data.workId).then(() => {
                    resolve(data.source as Sheet);
                    ctx.commit('addSheetToWork', data);
                }).catch(reject);
            });
        },
        removeSheetFromWork: (ctx: ActionContext<RootState, RootState>, data: WorkSource) => {
            return new Promise<Sheet>((resolve, reject) => {
                this.remoteState.detachFromWork((data.source as Sheet), data.workId).then(() => {
                    resolve(data.source as Sheet);
                    ctx.commit('removeSheetFromWork', data);
                }).catch(reject);
            });
        },
    };
    private readonly remoteState: RemoteSourceState<Sheet>;
    constructor(remoteState?: RemoteSourceState<Sheet>) {
        if (!remoteState) {
            this.remoteState = new NoopRemoteState<Sheet>();
        } else {
            this.remoteState = remoteState;
        }
    }
}
