import {EditorTool} from '@/data/measureEditor/tools/EditorTool';
import {ClickType, EditorMouseEvent} from '@/data/measureEditor/tools/EditorMouseEvent';
import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
import {RGB} from '@/data/measureEditor/RGB';

export class CountingRenameTool extends EditorTool {

    private currentNumberId: number | null = null;

    public handleEvent(e: EditorMouseEvent, staticElements: PrimitiveElement[],
                       dynamicElements: PrimitiveElement[]) {
        this.events.clearDynamicPrimitives();

        if (e.clickType === ClickType.Left) {
            // delete element
            const element = EditorTool.getHoverElement(e.currentPosition, staticElements);
            if (element) {
                if (!this.currentNumberId) {
                    const parsed = Number.parseInt(element.label, 10);
                    if (!isNaN(parsed)) {
                        this.currentNumberId = parsed;
                    }
                } else {
                    this.currentNumberId++;
                    element.label = this.currentNumberId.toString();
                    this.events.changePrimitive(element);
                }
            }
        } else if (e.clickType === ClickType.Right && this.currentNumberId) {
            this.currentNumberId = null;
        }
        if (this.currentNumberId) {
            // show element with previous id
            for (const element of staticElements) {
                if (element.label === this.currentNumberId.toString()) {
                    const previousElement = new PrimitiveElement(element.id, element.label,
                        new RGB(0, 0, 1), element.points);
                    this.events.createDynamicPrimitive(previousElement);
                    break;
                }
            }
            this.createElementOnHover(e, staticElements, new RGB(0.2, 1, 0));
        } else {
            super.handleEvent(e, staticElements, dynamicElements);
        }

    }
}
