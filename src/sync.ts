// this file is responsible to sync the data in the vuex store with some backend

import {Mutations, RootState} from '@/store';
import {MutationPayload, Store} from 'vuex';

export class SyncService {
    private store: Store<RootState>;
    private backends: SyncBackend[] = [];
    constructor(store: Store<RootState>) {
        this.store = store;
        this.store.subscribe((mutation: MutationPayload, state: RootState) => {
            for (const backend of this.backends) {
                backend.handleMutation(mutation, state);
            }
        });
    }
    public subscribe(backend: SyncBackend) {
        this.backends.push(backend);
        backend.subscribe(this.store);
    }
    public unsubscribe(backend: SyncBackend) {
        const index = this.backends.findIndex((b) => b === backend);
        if (index > -1) {
            this.backends[index].unsubscribe();
            this.backends.splice(index, 1);
        }
    }
}

export interface StoreProxy {
    commit: (mutationType: Mutations, payload: any) => void;
    dispatch: (actionType: Mutations, payload: any) => Promise<any>; // TODO: Split actions into a separate enum
}

export interface SyncBackend {
    handleMutation: (mutation: MutationPayload, state: RootState) => void;
    subscribe: (store: StoreProxy) => void;
    unsubscribe: () => void;
}
