// this is a dirty hack to quickly flag an object as mutated

export class Mutatable {
    private internalMutationState: boolean = false;
    public mutate() {
        this.internalMutationState = !this.internalMutationState;
    }
}
