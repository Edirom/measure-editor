import {Work} from '@/data/Work';
import {StoreType} from '@/store/StoreType';
import {ActionContext, ActionTree, GetterTree, MutationTree} from 'vuex';
import {NoopRemoteState, RemoteState} from '@/store/RemoteState';
import {StoreWork} from '@/data/store';
import {StateMutator} from '@/store/StateMutator';
import {RootState} from '@/store/index';

export class WorkStore implements StoreType<RootState> {
    public getters: GetterTree<RootState, RootState> = {
        works(state): { [id: string]: Work } {
            const converted: { [id: string]: Work } = {};
            for (const id in state._works) {
                if (state._works.hasOwnProperty(id)) {
                    converted[id] = StoreWork.createWork(state._works[id], state);
                }
            }
            return converted;
        },
    };
    public mutations: MutationTree<RootState> = {
        addWork(state: RootState, work: Work) {
            StateMutator.stateAdd<StoreWork>(state._works, work.id, new StoreWork(work));
        },
        deleteWork(state: RootState, work: Work) {
            StateMutator.stateDelete<StoreWork>(state._works, work.id);
        },
        modifyWork(state: RootState, work: Work) {
            StateMutator.stateDelete<StoreWork>(state._works, work.id);
            StateMutator.stateAdd<StoreWork>(state._works, work.id, new StoreWork(work));
        },
    };
    public actions: ActionTree<RootState, RootState> = {
        addWork: (ctx: ActionContext<RootState, RootState>, work: Work) => {
            return new Promise<Work>((resolve, reject) => {
                this.remoteState.create(work).then((newWork: Work) => {
                    ctx.commit('addWork', newWork);
                    resolve(newWork);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        deleteWork: (ctx: ActionContext<RootState, RootState>, work: Work) => {
            return new Promise<Work>((resolve, reject) => {
                this.remoteState.delete(work).then((newWork: Work) => {
                    ctx.commit('deleteWork', newWork);
                    resolve(newWork);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        modifyWork: (ctx: ActionContext<RootState, RootState>, work: Work) => {
            return new Promise<Work>((resolve, reject) => {
                this.remoteState.update(work).then((updatedWork: Work) => {
                    ctx.commit('modifyWork', updatedWork);
                    resolve(updatedWork);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
    };
    private readonly remoteState: RemoteState<Work>;
    constructor(remoteState?: RemoteState<Work>) {
        if (!remoteState) {
            this.remoteState = new NoopRemoteState<Work>();
        } else {
            this.remoteState = remoteState;
        }
    }
}
