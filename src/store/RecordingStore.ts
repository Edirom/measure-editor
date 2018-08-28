import {AudioRecording} from '@/data/AudioRecording';
import {StoreType} from '@/store/StoreType';
import {ActionContext, ActionTree, GetterTree, MutationTree} from 'vuex';
import {NoopRemoteState, RemoteSourceState} from '@/store/RemoteState';
import {StateMutator} from '@/store/StateMutator';
import {RootState} from '@/store/index';
import {WorkSource} from '@/types';

export class RecordingStore implements StoreType<RootState> {
    public getters: GetterTree<RootState, RootState> = {
        recordings(state): { [id: string]: AudioRecording } {
            return state._recordings;
        },
    };
    public mutations: MutationTree<RootState> = {
        addRecording(state: RootState, recording: AudioRecording) {
            StateMutator.stateAdd<AudioRecording>(state._recordings, recording.id, recording);
        },
        deleteRecording(state: RootState, recording: AudioRecording) {
            StateMutator.stateDelete<AudioRecording>(state._recordings, recording.id);
        },
        addRecordingToWork(state: RootState, data: WorkSource) {
            state._works[data.workId].recordings =
                state._works[data.workId].recordings.slice().concat([data.source.id]);
        },
        removeRecordingFromWork(state: RootState, data: WorkSource) {
            const clone = state._works[data.workId].recordings.slice();
            if (StateMutator.removeFromArray<string>(clone, ((s) => s === data.source.id))) {
                state._works[data.workId].recordings = clone;
            }
        },
    };
    public actions: ActionTree<RootState, RootState> = {
        addRecording: (ctx: ActionContext<RootState, RootState>, recording: AudioRecording) => {
            return new Promise<AudioRecording>((resolve, reject) => {
                this.remoteState.create(recording).then((newRecording: AudioRecording) => {
                    ctx.commit('addRecording', newRecording);
                    resolve(newRecording);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        deleteRecording: (ctx: ActionContext<RootState, RootState>, recording: AudioRecording) => {
            return new Promise<AudioRecording>((resolve, reject) => {
                this.remoteState.delete(recording).then((newRecording: AudioRecording) => {
                    ctx.commit('deleteRecording', newRecording);
                    resolve(newRecording);
                }).catch((error) => {
                    // TODO: error handling
                    reject(error);
                });
            });
        },
        addRecordingToWork: (ctx: ActionContext<RootState, RootState>, data: WorkSource) => {
            return new Promise<AudioRecording>((resolve, reject) => {
                this.remoteState.attachToWork((data.source as AudioRecording), data.workId).then(() => {
                    resolve(data.source as AudioRecording);
                    ctx.commit('addRecordingToWork', data);
                }).catch(reject);
            });
        },
        removeRecordingFromWork: (ctx: ActionContext<RootState, RootState>, data: WorkSource) => {
            return new Promise<AudioRecording>((resolve, reject) => {
                this.remoteState.detachFromWork((data.source as AudioRecording), data.workId).then(() => {
                    resolve(data.source as AudioRecording);
                    ctx.commit('removeRecordingFromWork', data);
                }).catch(reject);
            });
        },
    };
    private readonly remoteState: RemoteSourceState<AudioRecording>;
    constructor(remoteState?: RemoteSourceState<AudioRecording>) {
        if (!remoteState) {
            this.remoteState = new NoopRemoteState<AudioRecording>();
        } else {
            this.remoteState = remoteState;
        }
    }
}
