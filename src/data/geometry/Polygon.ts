// import {Vector2} from '@/data/geometry/Vector2';
import {PolyContainer} from '@/data/geometry/PolyContainer';
import {Point} from '@/data/measureEditor/Point';

export interface Polygon {
    points: Point[];
    container?: PolyContainer;
}
