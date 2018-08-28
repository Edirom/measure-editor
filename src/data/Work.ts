import {Source} from '@/data/Source';

export class Work {
    public composer: string = '';
    public year: string = '';
    public signature: string = '';
    public description: string = '';
    public get displayName(): string {
        return this.title + ' - ' + this.composer + (this.signature ? ' [' + this.signature + ']' : '');
    }
    constructor(
        public id: string,
        public title: string,
        public sources: Source[],
    ) {}
}
