import {Source} from '@/data/Source';
import {Measure} from '@/data/Measure';
import {Vector2} from '@/data/geometry/Vector2';

export interface WorkSource {
    workId: string;
    source: Source;
}

export interface MeasureOnSheet {
    measure: Measure;
    sheetId: string;
    page: number;
    imageId: string;
    skipMei?: boolean;
}

export interface MeasureSplit extends MeasureOnSheet {
    collisionPoints: [Vector2, Vector2];
}
