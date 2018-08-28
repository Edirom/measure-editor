import {Source} from '@/data/Source';
import {Instrument} from '@/data/Instrument';
import {Measure} from '@/data/Measure';

export class Image implements Source {
    public get type(): string {
        return 'image';
    }
    // public instruments: Instrument[] = [];
    public measures: Measure[] = [];
    public sheetId?: string;
    constructor(public id: string,
                public name: string,
                public imagepath: string,
                public width: number,
                public height: number) {}
}
