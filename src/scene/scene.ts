// src/scene.ts
import { Renderable } from '../interface/interfaces';
import { Light } from './light';
import { Color } from '../geometry/math';


export class Scene {
    
    objects: Renderable[];
    lights: Light[];
    ambientLight: Color; /// Global ambient lighting

    constructor() {
        this.objects = [];
        this.lights = [];
        this.ambientLight = new Color(0.1, 0.1, 0.1); /// Global ambient lighting
    }

    add(object: Renderable) { this.objects.push(object); }
    addLight(light: Light) { this.lights.push(light); }
}
