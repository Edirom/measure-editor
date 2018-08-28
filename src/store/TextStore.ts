import {TextSource} from '@/data/TextSource';
import {StoreType} from '@/store/StoreType';
import {ActionContext, ActionTree, GetterTree, MutationTree} from 'vuex';
import {NoopRemoteState, RemoteSourceState} from '@/store/RemoteState';
import {StateMutator} from '@/store/StateMutator';
import {RootState} from '@/store/index';
import {WorkSource} from '@/types';

export class TextStore implements StoreType<RootState> {
    public getters: GetterTree<RootState, RootState> = {
        texts(state): { [id: string]: TextSource } {
            return state._texts;
        },
    };
    public mutations: MutationTree<RootState> = {
        addText(state: RootState, text: TextSource) {
            StateMutator.stateAdd<TextSource>(state._texts, text.id, text);
        },
        deleteText(state: RootState, text: TextSource) {
            StateMutator.stateDelete<TextSource>(state._texts, text.id);
        },
        addTextToWork(state: RootState, data: WorkSource) {
            state._works[data.workId].texts =
                state._works[data.workId].texts.slice().concat([data.source.id]);
        },
        removeTextFromWork(state: RootState, data: WorkSource) {
            const clone = state._works[data.workId].texts.slice();
            if (StateMutator.removeFromArray<string>(clone, ((s) => s === data.source.id))) {
                state._works[data.workId].texts = clone;
            }
        },
    };
    public actions: ActionTree<RootState, RootState> = {
        addText: (ctx: ActionContext<RootState, RootState>, text: TextSource) => {
            return new Promise<TextSource>((resolve, reject) => {
                this.remoteState.create(text).then((newText: TextSource) => {
                    ctx.commit('addText', newText);
                    resolve(newText);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        deleteText: (ctx: ActionContext<RootState, RootState>, text: TextSource) => {
            return new Promise<TextSource>((resolve, reject) => {
                this.remoteState.delete(text).then((newText: TextSource) => {
                    ctx.commit('deleteText', newText);
                    resolve(newText);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        addTextToWork: (ctx: ActionContext<RootState, RootState>, data: WorkSource) => {
            return new Promise<TextSource>((resolve, reject) => {
                this.remoteState.attachToWork((data.source as TextSource), data.workId).then(() => {
                    resolve(data.source as TextSource);
                    ctx.commit('addTextToWork', data);
                }).catch(reject);
            });
        },
        removeTextFromWork: (ctx: ActionContext<RootState, RootState>, data: WorkSource) => {
            return new Promise<TextSource>((resolve, reject) => {
                this.remoteState.detachFromWork((data.source as TextSource), data.workId).then(() => {
                    resolve(data.source as TextSource);
                    ctx.commit('removeTextFromWork', data);
                }).catch(reject);
            });
        },
    };
    private readonly remoteState: RemoteSourceState<TextSource>;
    constructor(remoteState?: RemoteSourceState<TextSource>) {
        if (!remoteState) {
            this.remoteState = new NoopRemoteState<TextSource>();
        } else {
            this.remoteState = remoteState;
        }
    }
}
