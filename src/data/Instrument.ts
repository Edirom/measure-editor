import {Polygon} from '@/data/geometry/Polygon';
import {PolyContainer} from '@/data/geometry/PolyContainer';

export class Instrument implements PolyContainer {
    public id: number = 0;
    constructor(
        public name: string,
        public color: string,
        public geometry: Polygon[],
    ) {}
    public getColor(): string {
        return this.color;
    }
    public getName(): string {
        return this.name;
    }
}
