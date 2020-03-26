import {RGB} from '@/data/measureEditor/RGB';
import {Point} from '@/data/measureEditor/Point';

export class PrimitiveElement {
    public isVisible = true;
    constructor(public id: string, public label: string, public color: RGB, public points: Point[]) {

    }
}
