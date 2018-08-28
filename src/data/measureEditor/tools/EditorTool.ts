import {EditorMouseEvent} from '@/data/measureEditor/tools/EditorMouseEvent';
import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
import {EditorToolEvents} from '@/data/measureEditor/tools/EditorToolEvents';
import {Point} from '@/data/measureEditor/Point';
import {PolygonUtility} from '@/data/measureEditor/PolygonUtility';
import {generateUUID} from '@/data/utils';
import {RGB} from '@/data/measureEditor/RGB';

export class EditorTool {
    protected static getNextId(staticElements: PrimitiveElement[], dynamicElements: PrimitiveElement[]): string {
        return generateUUID();
    }

    protected static getHoverElement(mousePosition: Point,
                                     staticElements: PrimitiveElement[]): PrimitiveElement | null {
        for (let i = staticElements.length - 1; i >= 0; --i) {
            const element = staticElements[i];
            if (PolygonUtility.contains(element.points, mousePosition)) {
                return element;
            }
        }
        return null;
    }

    constructor(protected events: EditorToolEvents) {
    }

    public onToolSelected(staticElements: PrimitiveElement[]) {
        // use this comment to circumvent the "empty block" warning
        // desired default behavior is to do nothing
    }

    public handleEvent(e: EditorMouseEvent, staticElements: PrimitiveElement[],
                       dynamicElements: PrimitiveElement[]) {
        this.events.clearDynamicPrimitives();
        this.createElementOnHover(e, staticElements);
    }

    protected createElementOnHover(e: EditorMouseEvent, staticElements: PrimitiveElement[], color?: RGB) {
        let hoverElement = EditorTool.getHoverElement(e.currentPosition, staticElements);
        if (hoverElement) {
            if (color) {
                hoverElement = new PrimitiveElement(hoverElement.id, hoverElement.label, color, hoverElement.points);
            }
            this.events.createDynamicPrimitive(hoverElement);
        }
    }
}
