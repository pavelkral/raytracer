
import { Vector3 } from '../../geometry/math';
import { Ray } from '../../ray';
import { Material, Intersection, Renderable } from '../../interface/interfaces';

// Sphere 
export class Sphere implements Renderable {

    center: Vector3;
    radius: number;
    material: Material;

    constructor(center: Vector3, radius: number, material: Material) {
        this.center = center;
        this.radius = radius;
        this.material = material;
    }

    // detect ray-sphere intersection  
    intersect(ray: Ray): Intersection | null {
        const oc = ray.origin.subtract(this.center);
        const a = ray.direction.dot(ray.direction);
        const b = 2.0 * oc.dot(ray.direction);
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return null; // No intersection =======
        } else {
            const t0 = (-b - Math.sqrt(discriminant)) / (2.0 * a);
            const t1 = (-b + Math.sqrt(discriminant)) / (2.0 * a);

            let t = t0;
            // Check if intersection is behind ray origin or too close (to prevent self-intersection) 
            if (t < 0.001) {
                t = t1;
            }
            if (t < 0.001) {
                return null; // Both intersections are behind ray origin
            }

            const point = ray.origin.add(ray.direction.multiplyScalar(t));
            const normal = point.subtract(this.center).normalize(); // Normal at intersection point

            return { point, normal, distance: t, object: this };
        }
    }
}

// Plane class
export class Plane implements Renderable {
    
    point: Vector3;
    normal: Vector3;
    material: Material;

    constructor(point: Vector3, normal: Vector3, material: Material) {
        this.point = point; // Point on the plane
        this.normal = normal.normalize(); // Plane normal (must be normalized)
        this.material = material;
    }

    // Method to detect ray-plane intersection
    intersect(ray: Ray): Intersection | null {
        const denom = this.normal.dot(ray.direction);
        if (Math.abs(denom) < 0.001) {
            return null; // Ray is parallel to the plane
        }

        const t = this.point.subtract(ray.origin).dot(this.normal) / denom;

        if (t < 0.001) {
            return null; // Intersection is behind ray origin
        }

        const point = ray.origin.add(ray.direction.multiplyScalar(t));
        const normal = this.normal; // Plane normal is constant

        return { point, normal, distance: t, object: this };
    }
}
