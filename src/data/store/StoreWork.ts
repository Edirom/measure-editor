import {Mutatable} from './Mutatable';
import {RootState} from '@/store';
import {Work} from '@/data/Work';
import {Source} from '@/data/Source';
import {StoreSheet} from './StoreSheet';
import {StoreImage} from '@/data/store/StoreImage';

export class StoreWork extends Mutatable {
    public static createWork(w: StoreWork, state: RootState): Work {
        const sources: Source[] = [];
        for (const index of w.sheets) {
            sources.push(StoreSheet.createSheet(state._sheets[index], state));
        }
        for (const index of w.images) {
            sources.push(StoreImage.createImage(state._images[index], state));
        }
        for (const index of w.recordings) {
            sources.push(state._recordings[index]);
        }
        for (const index of w.texts) {
            sources.push(state._texts[index]);
        }
        const work = new Work(w.id, w.title, sources);
        work.composer = w.composer;
        work.year = w.year;
        work.signature = w.signature;
        work.description = w.description;
        return work;
    }
    public id: string;
    public title: string;
    public composer: string;
    public year: string;
    public signature: string;
    public description: string;
    // TODO: in reality a work has a list of sources (which can be any of sheet, recording, text or image)
    // TODO: since that is not really doable with just a list of indices we have a list for all of those individually
    // TODO: and put that together at conversion. this gets rid of the arbitrary order of sources though
    public sheets: string[];
    public recordings: string[];
    public texts: string[];
    public images: string[];
    constructor(w: Work) {
        super();
        this.id = w.id;
        this.title = w.title;
        this.composer = w.composer;
        this.year = w.year;
        this.signature = w.signature;
        this.description = w.description;
        this.sheets = w.sources.filter((s) => s.type === 'sheet').map((s) => s.id);
        this.recordings = w.sources.filter((s) => s.type === 'audio').map((s) => s.id);
        this.texts = w.sources.filter((s) => s.type === 'text').map((s) => s.id);
        this.images = w.sources.filter((s) => s.type === 'image').map((s) => s.id);
    }
}
