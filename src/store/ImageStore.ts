import {Image} from '@/data/Image';
import {StoreType} from '@/store/StoreType';
import {ActionContext, ActionTree, GetterTree, MutationTree} from 'vuex';
import {NoopRemoteState, RemoteSourceState} from '@/store/RemoteState';
import {StoreImage} from '@/data/store';
import {StateMutator} from '@/store/StateMutator';
import {RootState} from '@/store/index';
import {WorkSource} from '@/types';

interface SheetImage {
    image: Image;
    sheetId: string;
}

export class ImageStore implements StoreType<RootState> {
    public getters: GetterTree<RootState, RootState> = {
        images(state): { [id: string]: Image } {
            const converted: { [id: string]: Image } = {};
            for (const id in state._images) {
                if (state._images.hasOwnProperty(id)) {
                    converted[id] = StoreImage.createImage(state._images[id], state);
                }
            }
            return converted;
        },
    };
    public mutations: MutationTree<RootState> = {
        addImage(state: RootState, image: Image) {
            StateMutator.stateAdd<StoreImage>(state._images, image.id, new StoreImage(image));
        },
        deleteImage(state: RootState, image: Image) {
            StateMutator.stateDelete<StoreImage>(state._images, image.id);
        },
        addImageToSheet(state, data: SheetImage) {
            if (state._sheets.hasOwnProperty(data.sheetId) && state._images.hasOwnProperty(data.image.id)) {
                state._sheets[data.sheetId].images = state._sheets[data.sheetId].images.concat([data.image.id]);
                state._images[data.image.id].sheetId = data.sheetId;
            }
        },
        removeImageFromSheet(state, data: SheetImage) {
            if (state._sheets.hasOwnProperty(data.sheetId) && state._images.hasOwnProperty(data.image.id)) {
                const images = state._sheets[data.sheetId].images.slice();
                if (StateMutator.removeFromArray<string>(images, ((i) => i === data.image.id))) {
                    state._sheets[data.sheetId].images = images;
                    state._images[data.image.id].sheetId = undefined;
                }
            }
        },
        addImageToWork(state: RootState, data: WorkSource) {
            state._works[data.workId].images =
                state._works[data.workId].images.slice().concat([data.source.id]);
        },
        removeImageFromWork(state: RootState, data: WorkSource) {
            const clone = state._works[data.workId].images.slice();
            if (StateMutator.removeFromArray<string>(clone, ((s) => s === data.source.id))) {
                state._works[data.workId].images = clone;
            }
        },
        updateImage(state: RootState, data: Image) {
            StateMutator.stateDelete<StoreImage>(state._images, data.id);
            StateMutator.stateAdd<StoreImage>(state._images, data.id, new StoreImage(data));
        },
    };
    public actions: ActionTree<RootState, RootState> = {
        addImage: (ctx: ActionContext<RootState, RootState>, image: Image) => {
            return new Promise<Image>((resolve, reject) => {
                this.remoteState.create(image).then((newImage: Image) => {
                    ctx.commit('addImage', newImage);
                    resolve(newImage);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        deleteImage: (ctx: ActionContext<RootState, RootState>, image: Image) => {
            return new Promise<Image>((resolve, reject) => {
                this.remoteState.delete(image).then((newImage: Image) => {
                    ctx.commit('deleteImage', newImage);
                    resolve(newImage);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        addImageToSheet: (ctx: ActionContext<RootState, RootState>, data: SheetImage) => {
            return new Promise<Image>((resolve, reject) => {
                data.image.sheetId = data.sheetId;
                this.remoteState.update(data.image).then(() => {
                    resolve(data.image);
                    ctx.commit('addImageToSheet', data);
                }).catch(reject);
            });
        },
        removeImageFromSheet: (ctx: ActionContext<RootState, RootState>, data: SheetImage) => {
            return new Promise<Image>((resolve, reject) => {
                data.image.sheetId = undefined;
                this.remoteState.update(data.image).then(() => {
                    resolve(data.image);
                    ctx.commit('removeImageFromSheet', data);
                }).catch(reject);
            });
        },
        addImageToWork: (ctx: ActionContext<RootState, RootState>, data: WorkSource) => {
            return new Promise<Image>((resolve, reject) => {
                this.remoteState.attachToWork((data.source as Image), data.workId).then(() => {
                    resolve(data.source as Image);
                    ctx.commit('addImageToWork', data);
                }).catch(reject);
            });
        },
        removeImageFromWork: (ctx: ActionContext<RootState, RootState>, data: WorkSource) => {
            return new Promise<Image>((resolve, reject) => {
                this.remoteState.detachFromWork((data.source as Image), data.workId).then(() => {
                    resolve(data.source as Image);
                    ctx.commit('removeImageFromWork', data);
                }).catch(reject);
            });
        },
        updateImage: (ctx: ActionContext<RootState, RootState>, data: Image) => {
            return new Promise<Image>((resolve, reject) => {
                this.remoteState.update(data).then((updatedImage) => {
                    ctx.commit('updateImage', updatedImage);
                    resolve(updatedImage);
                }).catch(reject);
            });
        },
    };
    private readonly remoteState: RemoteSourceState<Image>;
    constructor(remoteState?: RemoteSourceState<Image>) {
        if (!remoteState) {
            this.remoteState = new NoopRemoteState<Image>();
        } else {
            this.remoteState = remoteState;
        }
    }
}
