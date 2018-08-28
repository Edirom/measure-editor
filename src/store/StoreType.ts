import {ActionTree, GetterTree, MutationTree} from 'vuex';

export interface StoreType<T> {
    getters: GetterTree<T, T>;
    mutations: MutationTree<T>;
    actions: ActionTree<T, T>;
}
