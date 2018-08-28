export class Point {
    public static distance(a: Point, b: Point) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    constructor(public x: number, public y: number) {
    }
}
