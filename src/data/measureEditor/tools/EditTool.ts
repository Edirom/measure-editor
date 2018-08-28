import {EditorTool} from '@/data/measureEditor/tools/EditorTool';
import {ClickType, EditorMouseEvent} from '@/data/measureEditor/tools/EditorMouseEvent';
import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
import {RGB} from '@/data/measureEditor/RGB';
import {Point} from '@/data/measureEditor/Point';
import {generateUUID} from '@/data/utils';

enum ChangeMode {
    None,
    Top,
    Left,
    Bottom,
    Right,
}

export class EditTool extends EditorTool {

    private startValue: number = 0;
    private elementId: string | null = null;
    private changeMode: ChangeMode = ChangeMode.None;

    public handleEvent(e: EditorMouseEvent, staticElements: PrimitiveElement[],
                       dynamicElements: PrimitiveElement[]) {
        this.events.clearDynamicPrimitives();

        if (!this.elementId && e.clickType === ClickType.Left) {
            // try begin operation
            const element = EditorTool.getHoverElement(e.currentPosition, staticElements);
            if (element) {
                this.elementId = element.id;
                this.changeMode = ChangeMode.None;
            }
        }

        if (e.clickType === ClickType.Right) {
            if (this.changeMode === ChangeMode.None) {
                // cancel operation
                this.elementId = null;
                this.onCancel(staticElements);
                return;
            } else {
                // cancel change mode
                this.changeMode = ChangeMode.None;
                this.onCancel(staticElements);
            }
        }

        if (this.elementId) {
            let element = null;
            for (const item of staticElements) {
                if (item.id === this.elementId) {
                    element = item;
                    break;
                }
            }
            if (!element) {
                // invalid state
                this.elementId = null;
                this.onCancel(staticElements);
                return;
            }

            let id = EditorTool.getNextId(staticElements, dynamicElements);

            let left = Math.min(...element.points.map((p) => p.x));
            let right = Math.max(...element.points.map((p) => p.x));
            let top = Math.min(...element.points.map((p) => p.y));
            let bottom = Math.max(...element.points.map((p) => p.y));
            let centerX = (left + right) / 2;
            let centerY = (top + bottom) / 2;

            const gizmoWidth = 5;
            const gizmoHeight = 5;
            const gizmoWidthOver2 = gizmoWidth / 2;
            const gizmoHeightOver2 = gizmoHeight / 2;
            const gizmoColor = new RGB(0, 0, 1);
            const previewColor = new RGB(1, 1, 0);

            if (this.changeMode === ChangeMode.None) {
                this.handleGizmos(e, top, left, bottom, right, centerX, centerY, gizmoWidthOver2, gizmoHeightOver2,
                    gizmoColor);
                // user clicked on gizmo
                // if (this.changeMode !== ChangeMode.None) {
                //     element.isVisible = false;
                //     this.events.changePrimitive(element);
                // }
            } else {
                if (this.changeMode === ChangeMode.Top) {
                    top = e.currentPosition.y;
                } else if (this.changeMode === ChangeMode.Left) {
                    left = e.currentPosition.x;
                } else if (this.changeMode === ChangeMode.Bottom) {
                    bottom = e.currentPosition.y;
                } else if (this.changeMode === ChangeMode.Right) {
                    right = e.currentPosition.x;
                }
                let flippedX = false;
                let flippedY = false;
                if (bottom < top) {
                    const swap = top;
                    top = bottom;
                    bottom = swap;
                    flippedY = true;
                }
                if (right < left) {
                    const swap = left;
                    left = right;
                    right = swap;
                    flippedX = true;
                }
                centerX = (left + right) / 2;
                centerY = (top + bottom) / 2;

                const previewElement = this.createRectangle(id, top, left, bottom, right, previewColor);
                this.events.createDynamicPrimitive(previewElement);

                id = EditorTool.getNextId(staticElements, dynamicElements);
                if (flippedY && this.changeMode === ChangeMode.Bottom ||
                    !flippedY && this.changeMode === ChangeMode.Top) {
                    const gizmo = this.createGizmo(id, centerX, top, gizmoWidthOver2, gizmoHeightOver2, gizmoColor);
                    this.events.createDynamicPrimitive(gizmo);
                } else if (flippedX && this.changeMode === ChangeMode.Right ||
                    !flippedX && this.changeMode === ChangeMode.Left) {
                    const gizmo = this.createGizmo(id, left, centerY, gizmoWidthOver2, gizmoHeightOver2, gizmoColor);
                    this.events.createDynamicPrimitive(gizmo);
                } else if (flippedY && this.changeMode === ChangeMode.Top ||
                    !flippedY && this.changeMode === ChangeMode.Bottom) {
                    const gizmo = this.createGizmo(id, centerX, bottom, gizmoWidthOver2, gizmoHeightOver2, gizmoColor);
                    this.events.createDynamicPrimitive(gizmo);
                } else if (flippedX && this.changeMode === ChangeMode.Left ||
                    !flippedX && this.changeMode === ChangeMode.Right) {
                    const gizmo = this.createGizmo(id, right, centerY, gizmoWidthOver2, gizmoHeightOver2, gizmoColor);
                    this.events.createDynamicPrimitive(gizmo);
                }

                if (e.clickType === ClickType.Left) {
                    // end operation
                    element.points = previewElement.points;
                    // element.isVisible = true;
                    this.events.changePrimitive(element);
                    this.elementId = null;
                }
            }
        } else {
            // show hover
            this.createElementOnHover(e, staticElements);
        }
    }

    private onCancel(staticElements: PrimitiveElement[]) {
        for (const element of staticElements) {
            if (!element.isVisible) {
                element.isVisible = true;
                this.events.changePrimitive(element);
            }
        }
    }

    private handleGizmos(e: EditorMouseEvent,
                         top: number, left: number, bottom: number, right: number,
                         centerX: number, centerY: number, gizmoWidthOver2: number, gizmoHeightOver2: number,
                         gizmoColor: RGB) {

        const topElement =
            this.createGizmo(generateUUID(), centerX, top, gizmoWidthOver2, gizmoHeightOver2, gizmoColor);
        this.events.createDynamicPrimitive(topElement);
        if (this.contains(top - gizmoHeightOver2, centerX - gizmoWidthOver2,
            top + gizmoHeightOver2, centerX + gizmoWidthOver2, e.currentPosition)) {
            // add hover element
            this.events.createDynamicPrimitive(topElement);
            if (e.clickType === ClickType.Left) {
                this.changeMode = ChangeMode.Top;
            }
        }

        const leftElement =
            this.createGizmo(generateUUID(), left, centerY, gizmoWidthOver2, gizmoHeightOver2, gizmoColor);
        this.events.createDynamicPrimitive(leftElement);
        if (this.contains(centerY - gizmoHeightOver2, left - gizmoWidthOver2,
            centerY + gizmoHeightOver2, left + gizmoWidthOver2, e.currentPosition)) {
            // add hover element
            this.events.createDynamicPrimitive(leftElement);
            if (e.clickType === ClickType.Left) {
                this.changeMode = ChangeMode.Left;
            }
        }

        const bottomElement =
            this.createGizmo(generateUUID(), centerX, bottom, gizmoWidthOver2, gizmoHeightOver2, gizmoColor);
        this.events.createDynamicPrimitive(bottomElement);
        if (this.contains(bottom - gizmoHeightOver2, centerX - gizmoWidthOver2,
            bottom + gizmoHeightOver2, centerX + gizmoWidthOver2, e.currentPosition)) {
            // add hover element
            this.events.createDynamicPrimitive(bottomElement);
            if (e.clickType === ClickType.Left) {
                this.changeMode = ChangeMode.Bottom;
            }
        }

        const rightElement =
            this.createGizmo(generateUUID(), right, centerY, gizmoWidthOver2, gizmoHeightOver2, gizmoColor);
        this.events.createDynamicPrimitive(rightElement);
        if (this.contains(centerY - gizmoHeightOver2, right - gizmoWidthOver2,
            centerY + gizmoHeightOver2, right + gizmoHeightOver2, e.currentPosition)) {
            // add hover element
            this.events.createDynamicPrimitive(rightElement);
            if (e.clickType === ClickType.Left) {
                this.changeMode = ChangeMode.Right;
            }
        }
    }

    private createGizmo(id: string, centerX: number, centerY: number, gizmoWidthOver2: number,
                        gizmoHeightOver2: number, gizmoColor: RGB): PrimitiveElement {
        return this.createRectangle(id, centerY - gizmoHeightOver2, centerX - gizmoWidthOver2,
            centerY + gizmoHeightOver2, centerX + gizmoWidthOver2, gizmoColor);
    }

    private createRectangle(id: string, top: number, left: number, bottom: number, right: number, color: RGB)
        : PrimitiveElement {
        return new PrimitiveElement(id, '', color,
            [new Point(left, top), new Point(right, top), new Point(right, bottom), new Point(left, bottom)]);
    }

    private contains(top: number, left: number, bottom: number, right: number, point: Point): boolean {
        return left <= point.x && point.x <= right && top <= point.y && point.y <= bottom;
    }
}
