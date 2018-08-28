import {MEI, Zone} from './data';

export class MEIParser {
    public static parse(data: string): MEI {
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(data, 'application/xml');
        const meiDoc = MEI.fromDOM(doc.documentElement);
        const zonesById: {[id: string]: Zone} = {};
        if (meiDoc.music && meiDoc.music.facsimile) {
            for (const surface of meiDoc.music.facsimile.surfaces) {
                for (const zone of surface.zones) {
                    zonesById[zone.id] = zone;
                }
            }
            if (meiDoc.music.body) {
                for (const mdiv of meiDoc.music.body.mdivs) {
                    for (const score of mdiv.scores) {
                        for (const section of score.sections) {
                            for (const measure of section.measures) {
                                const ids = measure.facs.split(' ').map((id) => id.substr(1));
                                for (const id of ids) {
                                    if (zonesById.hasOwnProperty(id)) {
                                        zonesById[id].measures.push(measure);
                                    } else {
                                        console.warn('ID', id, 'of measure', measure.id, 'does not exist');
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return meiDoc;
    }
}
