import {
    Color,
    DoubleSide,
    Geometry,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    Scene,
    Shape,
    ShapeGeometry,
    TextGeometry,
    Vector2,
    Vector3,
} from 'three';
import {fontService} from '@/services/font.service';
import {Renderable} from '@/data/geometry/Renderable';

export class PointPolygon implements Renderable {
    constructor(private points: Vector2[], private color: Color, private text: string) {
    }

    public async addToScene(scene: Scene): Promise<void> {
        const fillShape = new Shape(this.points);
        const fillGeometry = new ShapeGeometry(fillShape);
        const fillMaterial = new MeshBasicMaterial({
            color: this.color,
            opacity: 0.5,
            side: DoubleSide,
            transparent: true,
        });
        const fillMesh = new Mesh(fillGeometry, fillMaterial);
        scene.add(fillMesh);
        // add outline
        const edgeGeometry = new Geometry();
        const centerPoint = new Vector2();
        for (const point of this.points) {
            centerPoint.x += point.x;
            centerPoint.y += point.y;
            edgeGeometry.vertices.push(new Vector3(point.x, point.y, 0));
        }
        centerPoint.x /= this.points.length;
        centerPoint.y /= this.points.length;
        // close the loop
        edgeGeometry.vertices.push(edgeGeometry.vertices[0].clone());
        const edgeMaterial = new LineBasicMaterial({color: this.color, linewidth: 2});
        const edgeMesh = new Line(edgeGeometry, edgeMaterial);
        scene.add(edgeMesh);
        const font = await fontService.getFont('helvetiker_bold.typeface.json');
        const textGeometry = new TextGeometry(this.text, {
            font,
            size: 2,
            height: 1,
            // TODO: use bevel segments to get smoother digits
        });
        const textMaterial = new MeshBasicMaterial({color: 0x000000});
        const textMesh = new Mesh(textGeometry, textMaterial);
        // TODO: proper positioning
        textMesh.position.x = centerPoint.x;
        textMesh.position.y = centerPoint.y;
        // since we invert the camera
        textMesh.position.z = 1;
        textMesh.scale.y = -1;
        scene.add(textMesh);
    }
}
