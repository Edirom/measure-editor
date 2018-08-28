import Vue from 'vue';

interface StateRootLevel<T> { [id: number]: T; }

export class StateMutator {
    public static stateDelete<T>(entities: StateRootLevel<T>, id: string): void {
        // TODO: the typings define object and T[] as valid first parameter but the compiler only accepts T[]
        Vue.delete((entities as any), id);
    }

    public static stateAdd<T>(entities: StateRootLevel<T>, id: string, element: T): void {
        if (entities.hasOwnProperty(id)) {
            return;
        }
        Vue.set((entities as any), id, element);
    }
    public static removeFromArray<T>(array: T[], cmpFn: ((t: T) => boolean)): boolean {
        const index = array.findIndex(cmpFn);
        if (index > -1) {
            array.splice(index, 1);
            return true;
        }
        return false;
    }
}
