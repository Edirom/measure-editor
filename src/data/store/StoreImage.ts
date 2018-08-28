import {Mutatable} from './Mutatable';
import {Image} from '@/data/Image';
import {RootState} from '@/store';

export class StoreImage extends Mutatable {
    public static createImage(i: StoreImage, state: RootState): Image {
        const newImage = new Image(i.id, i.name, i.imagepath, i.width, i.height);
        for (const index of i.measures) {
            newImage.measures.push(state._measures[index]);
        }
        if (i.sheetId) {
            newImage.sheetId = i.sheetId;
        }
        // for (const index of i.instruments) {
        //     newImage.instruments.push(state._instruments[index]);
        // }
        return newImage;
    }
    // public instruments: number[];
    public measures: string[];

    public id: string;
    public name: string;
    public imagepath: string;
    public width: number;
    public height: number;
    public sheetId?: string;
    constructor(i: Image) {
        super();
        this.id = i.id;
        this.name = i.name;
        this.imagepath = i.imagepath;
        this.width = i.width;
        this.height = i.height;
        if (i.sheetId) {
            this.sheetId = i.sheetId;
        }
        // if (i.instruments) {
        //     this.instruments = i.instruments.map((instrument) => instrument.id);
        // } else {
        //     this.instruments = [];
        // }
        if (i.measures) {
            this.measures = i.measures.map((m) => m.id);
        } else {
            this.measures = [];
        }
    }
}
