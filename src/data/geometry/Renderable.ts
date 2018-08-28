import {Scene} from 'three';

export interface Renderable {
    addToScene(scene: Scene): Promise<void>;
}
