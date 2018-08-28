import {Font, FontLoader} from 'three';

class FontService {
    private loadedFonts: {[name: string]: Font} = {};
    private fontLoader = new FontLoader();
    public getFont(name: string) {
        if (this.loadedFonts.hasOwnProperty(name)) {
            return Promise.resolve(this.loadedFonts[name]);
        }
        return new Promise<Font>((resolve, reject) => {
            this.fontLoader.load('/fonts/' + name, (font) => {
                this.loadedFonts[name] = font;
                resolve(font);
            }, undefined, (error) => {
                reject(error);
            });
        });
    }
}
export const fontService = new FontService();
