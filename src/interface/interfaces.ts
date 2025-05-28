
import { Vector3, Color } from '../geometry/math';
import { Ray } from '../ray';

export interface Material {
    color: Color;
    ambient: number;
    diffuse: number;
    specular: number;
    shininess: number;
    reflectivity: number;
}

//  ray-object intersection
export interface Intersection {
    point: Vector3;
    normal: Vector3;
    distance: number;
    object: Renderable; // Reference to the object that was intersected
}
//  renderable object
export interface Renderable {
    material: Material;
    intersect(ray: Ray): Intersection | null;
}
