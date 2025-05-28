
import { Vector3 } from '../geometry/math';
import { Ray } from '../ray';


export class Camera {

    position: Vector3;
    lookAt: Vector3;
    up: Vector3;
    fov: number;
    forward: Vector3;
    right: Vector3;

    constructor(position: Vector3, lookAt: Vector3, fov = 60, up = new Vector3(0, 1, 0)) {
        this.position = position;
        this.lookAt = lookAt;
        this.up = up.normalize();
        this.fov = fov; //  in degrees

        this.forward = this.lookAt.subtract(this.position).normalize();
        this.right = this.forward.cross(this.up).normalize();
        this.up = this.right.cross(this.forward).normalize(); // re-orthogonalize 'up'
    }

    generateRay(u: number, v: number, aspectRatio: number): Ray {
        const fovRad = this.fov * Math.PI / 180;
        const halfHeight = Math.tan(fovRad / 2);
        const halfWidth = halfHeight * aspectRatio;

        const x = (2 * u - 1) * halfWidth;
        const y = (1 - 2 * v) * halfHeight; // y-axis is usually inverted 

        const direction = this.forward
            .add(this.right.multiplyScalar(x))
            .add(this.up.multiplyScalar(y))
            .normalize();

        return new Ray(this.position, direction);
    }
}
