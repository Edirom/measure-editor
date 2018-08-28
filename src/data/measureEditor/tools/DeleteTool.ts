import {EditorTool} from '@/data/measureEditor/tools/EditorTool';
import {ClickType, EditorMouseEvent} from '@/data/measureEditor/tools/EditorMouseEvent';
import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';

export class DeleteTool extends EditorTool {

    public handleEvent(e: EditorMouseEvent, staticElements: PrimitiveElement[],
                       dynamicElements: PrimitiveElement[]) {
        this.events.clearDynamicPrimitives();

        if (e.clickType === ClickType.Left) {
            // delete element
            const element = EditorTool.getHoverElement(e.currentPosition, staticElements);
            if (element) {
                this.events.deletePrimitive(element);
            }
        } else {
            // handle hover
            this.createElementOnHover(e, staticElements);
        }
    }
}
