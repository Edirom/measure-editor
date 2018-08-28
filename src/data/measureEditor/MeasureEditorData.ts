import {MeasureEditorElement} from '@/data/measureEditor/MeasureEditorElement';
import {Point} from '@/data/measureEditor/Point';
import {PolygonUtility} from '@/data/measureEditor/PolygonUtility';

export class MeasureEditorData {

    public staticElements: MeasureEditorElement[] = [];
    public dynamicElements: MeasureEditorElement[] = [];

    public get elements(): MeasureEditorElement[] {
        return [...this.staticElements, ...this.dynamicElements];
    }

    public removeDynamicElement(element: MeasureEditorElement) {
        const index = this.dynamicElements.indexOf(element);
        if (index >= 0) {
            this.dynamicElements.splice(index, 1);
        }
    }

    public findElementAt(point: Point): MeasureEditorElement | null {
        for (const element of this.elements) {
            if (PolygonUtility.contains(element.vertices, point)) {
                return element;
            }
        }
        return null;
    }

    public handleHover(mousePosition: Point) {
        for (const element of this.elements) {
            element.isHovering = PolygonUtility.contains(element.vertices, mousePosition);
        }
    }
}
