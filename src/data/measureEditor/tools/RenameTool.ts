import {EditorTool} from '@/data/measureEditor/tools/EditorTool';
import {ClickType, EditorMouseEvent} from '@/data/measureEditor/tools/EditorMouseEvent';
import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';

export class RenameTool extends EditorTool {

    public handleEvent(e: EditorMouseEvent, staticElements: PrimitiveElement[],
                       dynamicElements: PrimitiveElement[]) {
        this.events.clearDynamicPrimitives();

        if (e.clickType === ClickType.Left) {
            const element = EditorTool.getHoverElement(e.currentPosition, staticElements);
            if (element) {
                this.events.requestRenamePrimitiveById(element.id);
            }
        } else {
            // show hover
            this.createElementOnHover(e, staticElements);
        }
    }
}
