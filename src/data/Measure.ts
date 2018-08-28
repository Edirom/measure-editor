import {Polygon} from '@/data/geometry/Polygon';
import {Segment} from '@/data/Segment';
import {PolyContainer} from '@/data/geometry/PolyContainer';

export class Measure implements PolyContainer {
    public static get defaultColor(): string {
        return 'var(--default-box-color)';
    }
    public static colorOf(s: Segment | null | undefined): string {
        return s ? s.color : Measure.defaultColor;
    }
    public id: string = '';
    public segmentId?: number;
    constructor(
        public name: string,
        public geometry: Polygon,
        public segment?: Segment | null,
    ) {
        geometry.container = this;
    }
    public getColor(): string {
        return Measure.colorOf(this.segment);
    }
    public getName(): string {
        return this.name;
    }
}
