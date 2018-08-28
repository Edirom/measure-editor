export class Vector2 {
    constructor(
        public x: number,
        public y: number,
        public transient: boolean = false,
    ) {}
    public toString() {
        return this.x + ',' + this.y;
    }
    public add(p: Vector2): Vector2 {
        return new Vector2(this.x + p.x, this.y + p.y);
    }
    public subtract(p: Vector2): Vector2 {
        return new Vector2(this.x - p.x, this.y - p.y);
    }
    public sqrDistance(p: Vector2): number {
        return ((this.x - p.x) * (this.x - p.x)) + ((this.y - p.y) * (this.y - p.y));
    }
    public multiply(s: number): Vector2 {
        return new Vector2(this.x * s, this.y * s);
    }
    public equals(vector: Vector2): boolean {
        return (Math.abs(this.x - vector.x) < Number.EPSILON && Math.abs(this.y - vector.y) < Number.EPSILON);
    }
    public dot(vector: Vector2): number {
        return (this.x * vector.x) * (this.y * vector.y);
    }
    public normalized(): Vector2 {
        const length = Math.sqrt(this.sqrDistance(new Vector2(0, 0)));
        return new Vector2(this.x / length, this.y / length);
    }
    public clone(): Vector2 {
        return new Vector2(this.x, this.y, this.transient);
    }
}
