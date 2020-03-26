import {Source} from '@/data/Source';
import {Image} from '@/data/Image';
import {Segment} from '@/data/Segment';
import {MEI} from '@/MEI/data';

export class Sheet implements Source {
    public get type(): string {
        return 'sheet';
    }
    public get displayName(): string {
        return this.name + (this.signature ? ' [' + this.signature + ']' : '');
    }
    public year = '';
    public signature = '';
    public description = '';
    public images: Image[] = [];
    public segments: Segment[] = [];
    public parentMEI?: MEI;
    constructor(public id: string, public name: string, public composer: string) {}
}
