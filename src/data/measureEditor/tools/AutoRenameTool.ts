import {EditorTool} from '@/data/measureEditor/tools/EditorTool';
import {EditorMouseEvent} from '@/data/measureEditor/tools/EditorMouseEvent';
import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
import {Point} from '@/data/measureEditor/Point';

export class AutoRenameTool extends EditorTool {

    public onToolSelected(staticElements: PrimitiveElement[]) {
        const distanceElements = staticElements.map((v) => {
            const center = this.getCenter(v.points);
            const distanceScaledSquared = center.x * center.x + center.y * center.y * 100;
            return {
                distance: distanceScaledSquared,
                element: v,
            };
        });

        distanceElements.sort((a, b) => {
            if (a.distance < b.distance) {
                return -1;
            } else if (a.distance > b.distance) {
                return 1;
            } else {
                return 0;
            }
        });

        for (let i = 0; i < distanceElements.length; ++i) {
            const element = distanceElements[i].element;
            element.label = (i + 1).toString();
            this.events.changePrimitive(element);
        }
        this.events.requestToolChange('mark');
    }

    private getCenter(points: Point[]): Point {
        const center = new Point(0, 0);
        for (const point of points) {
            center.x += point.x;
            center.y += point.y;
        }
        center.x /= points.length;
        center.y /= points.length;
        return center;
    }
}
