import {Mutatable} from './Mutatable';
import {Sheet} from '@/data/Sheet';
import {RootState} from '@/store';
import {StoreImage} from '@/data/store/index';
import {MEI} from '@/MEI/data';

export class StoreSheet extends Mutatable {
    public static createSheet(s: StoreSheet, state: RootState): Sheet {
        const newSheet = new Sheet(
            s.id,
            s.name,
            s.composer,
        );
        newSheet.year = s.year;
        newSheet.description = s.description;
        newSheet.signature = s.signature;
        for (const index of s.images) {
            newSheet.images.push(StoreImage.createImage(state._images[index], state));
        }
        newSheet.segments = s.segments.map((segment) => state._segments[segment]);
        newSheet.parentMEI = s.parentMEI;
        return newSheet;
    }
    public year: string;
    public signature: string;
    public description: string;
    public images: string[];
    public segments: string[];
    public id: string;
    public name: string;
    public composer: string;
    public parentMEI?: MEI;
    constructor(s: Sheet) {
        super();
        this.id = s.id;
        this.name = s.name;
        this.composer = s.composer;
        this.year = s.year;
        this.signature = s.signature;
        this.description = s.description;
        this.images = s.images.map((i) => i.id);
        this.segments = s.segments.map((segment) => segment.id);
        this.parentMEI = s.parentMEI;
    }
}
