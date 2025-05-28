
import { Vector3, Color } from '../geometry/math';


export class Light {
    
    position: Vector3;// Position of the light in the scene
    color: Color;// Color of the light, affecting the illumination it provides

    constructor(position: Vector3, color: Color) {
        this.position = position;
        this.color = color;
    }
}
