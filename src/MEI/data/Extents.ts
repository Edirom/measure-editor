export class Extents {
    public static fromAttributes(attributes: {[key: string]: string}): Extents | undefined {
        if (
            !attributes.hasOwnProperty('ulx') ||
            !attributes.hasOwnProperty('uly') ||
            !attributes.hasOwnProperty('lrx') ||
            !attributes.hasOwnProperty('lry')
        ) {
            return undefined;
        }
        const ulx = parseInt(attributes.ulx, 10);
        const uly = parseInt(attributes.uly, 10);
        const lrx = parseInt(attributes.lrx, 10);
        const lry = parseInt(attributes.lry, 10);
        if (isNaN(ulx) || isNaN(uly) || isNaN(lrx) || isNaN(lry)) {
            console.warn('Found extents, but could not parse values', {attributes});
            return undefined;
        }
        return new Extents(ulx, uly, lrx, lry);
    }
    constructor(
        public topLeftX: number,
        public topLeftY: number,
        public bottomRightX: number,
        public bottomRightY: number,
    ) {}
    public toPolygon() {
        return [
            {x: this.topLeftX, y: this.topLeftY},
            {x: this.bottomRightX, y: this.topLeftY},
            {x: this.bottomRightX, y: this.bottomRightY},
            {x: this.topLeftX, y: this.bottomRightY},
        ];
    }
    public addAttributesToNode(element: Element) {
        element.setAttribute('ulx', this.topLeftX.toString());
        element.setAttribute('uly', this.topLeftY.toString());
        element.setAttribute('lrx', this.bottomRightX.toString());
        element.setAttribute('lry', this.bottomRightY.toString());
    }
}
