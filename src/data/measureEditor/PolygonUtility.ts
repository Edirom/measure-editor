import {Point} from '@/data/measureEditor/Point';

export class PolygonUtility {
    public static contains(polygon: Point[], point: Point): boolean {
        // ray tracing even odd test
        let isOdd = false;
        const x = point.x;
        const y = point.y;
        for (let i = 0; i < polygon.length; ++i) {
            // get next vertex
            const j = (i === (polygon.length - 1)) ? 0 : i + 1;

            const startX = polygon[i].x;
            const startY = polygon[i].y;
            const endX = polygon[j].x;
            const endY = polygon[j].y;

            const sandwichY = (startY <= y && y <= endY) || (endY <= y && y <= startY);
            if (sandwichY) {
                const slope = (endX - startX) / (endY - startY);
                const pointOnSlope = (slope * (y - startY)) + startX;
                const intersects = x < pointOnSlope;
                if (intersects) {
                    isOdd = !isOdd;
                }
            }
        }
        return isOdd;
    }

    public static projectOnLineRectangle(start: Point, end: Point, point: Point): Point {
        if (end.y - start.y === 0) {
            const xmin = Math.min(start.x, end.x);
            const xmax = Math.max(start.x, end.x);
            const xvalue = Math.min(Math.max(xmin, point.x), xmax);
            return new Point(xvalue, start.y);
        } else if (end.x - start.x === 0) {
            const ymin = Math.min(start.y, end.y);
            const ymax = Math.max(start.y, end.y);
            const yvalue = Math.min(Math.max(ymin, point.y), ymax);
            return new Point(start.x, yvalue);
        }
        return new Point(NaN, NaN);
    }
}
