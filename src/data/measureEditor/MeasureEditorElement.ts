import {Point} from '@/data/measureEditor/Point';
import {RGB} from '@/data/measureEditor/RGB';

export class MeasureEditorElement {

    public vertices: Point[] = [];
    public borderWidth: number = 1;

    public text: string = '';
    public textOffset: Point = new Point(0, 0);

    public fontSize: number = 2;
    public fontPath: string = '/fonts/helvetiker_bold.typeface.json';

    public rgb: RGB = new RGB(0.56, 0.93, 0.56);

    public isHovering: boolean = false;

    public normalOpacity: number = 0.5;
    public hoverOpacity: number = 0.8;

    public get opacity(): number {
        return this.isHovering ? this.hoverOpacity : this.normalOpacity;
    }
}
