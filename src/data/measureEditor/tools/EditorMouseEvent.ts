import {Point} from '@/data/measureEditor/Point';

export enum ClickType {
    None,
    Left,
    Right,
}

export class EditorMouseEvent {
    constructor(public clickType: ClickType, public currentPosition: Point, public previousPosition: Point) {
    }
}
