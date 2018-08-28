import {EditorTool} from '@/data/measureEditor/tools/EditorTool';
import {ClickType, EditorMouseEvent} from '@/data/measureEditor/tools/EditorMouseEvent';
import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
import {Point} from '@/data/measureEditor/Point';
import {RGB} from '@/data/measureEditor/RGB';

export class MarkerTool extends EditorTool {

    private startPoint: Point | null = null;

    public handleEvent(e: EditorMouseEvent, staticElements: PrimitiveElement[],
                       dynamicElements: PrimitiveElement[]) {
        this.events.clearDynamicPrimitives();

        if (!this.startPoint) {
            if (e.clickType === ClickType.Left) {
                // begin operation
                this.startPoint = e.currentPosition;
                return;
            } else {
                // show hover
                this.createElementOnHover(e, staticElements);
                return;
            }
        }

        if (e.clickType === ClickType.Right) {
            // cancel operation
            this.startPoint = null;
            return;
        }

        const top = Math.min(this.startPoint.y, e.currentPosition.y);
        const bottom = Math.max(this.startPoint.y, e.currentPosition.y);
        const left = Math.min(this.startPoint.x, e.currentPosition.x);
        const right = Math.max(this.startPoint.x, e.currentPosition.x);
        const topLeft = new Point(left, top);
        const topRight = new Point(right, top);
        const bottomLeft = new Point(left, bottom);
        const bottomRight = new Point(right, bottom);
        const id = EditorTool.getNextId(staticElements, dynamicElements);
        // TODO: get from Toolbar
        const color = new RGB(0, 1, 0);
        const element = new PrimitiveElement(id, '', color,
            [topLeft, topRight, bottomRight, bottomLeft]);

        if (e.clickType === ClickType.Left) {
            // end operations
            this.startPoint = null;
            // add label
            // TODO how to reliably determine the next label? We only have the current page at this point
            const maxN = Math.max(...staticElements.map((el) => {
                const labelAsNumber = parseInt(el.label, 10);
                if (isNaN(labelAsNumber)) {
                    return 0;
                }
                return labelAsNumber;
            }));
            element.label = (maxN + 1).toString();
            this.events.createPrimitive(element);
        } else {
            // show preview
            this.events.createDynamicPrimitive(element);
        }
    }
}
