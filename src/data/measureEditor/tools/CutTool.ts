import {EditorTool} from '@/data/measureEditor/tools/EditorTool';
import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
import {ClickType, EditorMouseEvent} from '@/data/measureEditor/tools/EditorMouseEvent';
import {Point} from '@/data/measureEditor/Point';
import {RGB} from '@/data/measureEditor/RGB';
import {PolygonUtility} from '@/data/measureEditor/PolygonUtility';

export class CutTool extends EditorTool {
    private selectedElement: PrimitiveElement | null = null;

    public handleEvent(e: EditorMouseEvent, staticElements: PrimitiveElement[],
                       dynamicElements: PrimitiveElement[]) {
        this.events.clearDynamicPrimitives();

        // handle cancels
        if (e.clickType === ClickType.Right) {
            if (this.selectedElement) {
                this.cancelOperation(staticElements);
                return;
            }
        }

        if (!this.selectedElement && e.clickType === ClickType.Left) {
            // begin operation
            const element = EditorTool.getHoverElement(e.currentPosition, staticElements);
            if (element) {
                this.selectedElement = element;
                // hide all non selected elements
                this.events.hidePrimitives(this.selectedElement.id);
            }
        } else if (this.selectedElement) {
            // update operation
            this.events.createDynamicPrimitive(this.selectedElement);
            // find out if vertical or horizontal line is closer to mouse position
            let closestDistance = Number.MAX_VALUE;
            let closestIndex = 0;
            for (let i = 0; i < this.selectedElement.points.length; ++i) {
                const j = (i === 0) ? this.selectedElement.points.length - 1 : i - 1;
                const start = this.selectedElement.points[i];
                const end = this.selectedElement.points[j];
                const projectedPoint = PolygonUtility.projectOnLineRectangle(start, end, e.currentPosition);
                const distance = Point.distance(e.currentPosition, projectedPoint);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                }
            }
            const nextIndex = (closestIndex === 0) ? this.selectedElement.points.length - 1 : closestIndex - 1;
            const startPoint = this.selectedElement.points[closestIndex];
            const endPoint = this.selectedElement.points[nextIndex];

            // find bounds
            const left = Math.min(...this.selectedElement.points.map((p) => p.x));
            const right = Math.max(...this.selectedElement.points.map((p) => p.x));
            const top = Math.min(...this.selectedElement.points.map((p) => p.y));
            const bottom = Math.max(...this.selectedElement.points.map((p) => p.y));

            if (Math.abs(endPoint.x - startPoint.x) < Math.abs(endPoint.y - startPoint.y)) {
                // vertical
                const y = Math.min(Math.max(top, e.currentPosition.y), bottom);
                const lineElement = new PrimitiveElement('', '', new RGB(0.5, 0.5, 0),
                    [new Point(left, y - 1), new Point(right, y - 1),
                        new Point(right, y + 1), new Point(left, y + 1)]);
                this.performCut(e, staticElements, dynamicElements, lineElement, [
                    (p: Point) => {
                        // use existing element as top half
                        if (p.y === bottom) {
                            p.y = y;
                        }
                    },
                    (p: Point) => {
                        // create bottom half
                        if (p.y === top) {
                            p.y = y;
                        }
                    },
                ]);
            } else {
                // horizontal
                const x = Math.min(Math.max(left, e.currentPosition.x), right);
                const lineElement = new PrimitiveElement('', '', new RGB(0.5, 0.5, 0),
                    [new Point(x - 1, top), new Point(x + 1, top),
                        new Point(x + 1, bottom), new Point(x - 1, bottom)]);
                this.performCut(e, staticElements, dynamicElements, lineElement, [
                    (p: Point) => {
                        // use existing element as left half
                        if (p.x === right) {
                            p.x = x;
                        }
                    },
                    (p: Point) => {
                        // create right half
                        if (p.x === left) {
                            p.x = x;
                        }
                    }],
                );
            }
        } else {
            // show hover
            this.createElementOnHover(e, staticElements);
        }
    }

    private cancelOperation(staticElements: PrimitiveElement[]) {
        this.selectedElement = null;
        // show all hidden elements
        this.events.showPrimitives();
    }

    private performCut(e: EditorMouseEvent,
                       staticElements: PrimitiveElement[],
                       dynamicElements: PrimitiveElement[],
                       lineElement: PrimitiveElement,
                       [firstHalfCb, secondHalfCb]: Array<(p: Point) => void>,
                       ) {
        this.events.createDynamicPrimitive(lineElement);
        if (e.clickType === ClickType.Left && this.selectedElement) {
            // copy points
            const points = this.selectedElement.points.map((p) => new Point(p.x, p.y));
            const label = this.selectedElement.label;
            // use existing element as first half (left/top)
            this.selectedElement.label = label + 'a';
            for (const p of this.selectedElement.points) {
                firstHalfCb(p);
            }
            this.events.changePrimitive(this.selectedElement);
            // create second half (right/bottom)
            const id = EditorTool.getNextId(staticElements, dynamicElements);
            for (const p of points) {
                secondHalfCb(p);
            }
            const rightElement = new PrimitiveElement(id, label + 'b',
                this.selectedElement.color, points);
            this.events.createPrimitive(rightElement);
            this.cancelOperation(staticElements);
        }
    }
}
