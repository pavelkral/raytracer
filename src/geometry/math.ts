
// Vector3 (position, direction, colors)

export class Vector3 {
    
    x: number;
    y: number;
    z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // 
    add(v: Vector3): this { return new (this.constructor as any)(this.x + v.x, this.y + v.y, this.z + v.z); }
    subtract(v: Vector3): this { return new (this.constructor as any)(this.x - v.x, this.y - v.y, this.z - v.z); }
    multiplyScalar(s: number): this { return new (this.constructor as any)(this.x * s, this.y * s, this.z * s); }
    // Element-wise multiplication by vector (for colors)
    multiply(v: Vector3): this { return new (this.constructor as any)(this.x * v.x, this.y * v.y, this.z * v.z); }
    dot(v: Vector3): number { return this.x * v.x + this.y * v.y + this.z * v.z; }
    cross(v: Vector3): this {
        return new (this.constructor as any)(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }
    length(): number { return Math.sqrt(this.dot(this)); }
    normalize(): this {
        const len = this.length();
        return len > 0 ? this.multiplyScalar(1 / len) : new (this.constructor as any)(0, 0, 0);
    }
    static zero(): Vector3 { return new Vector3(0, 0, 0); }
}

// Color class (extends Vector3)
export class Color extends Vector3 {
    constructor(r = 0, g = 0, b = 0) { super(r, g, b); }

    // Clamp color components to [0, 1] range
    clamp(): Color {
        return new Color(
            Math.max(0, Math.min(1, this.x)),
            Math.max(0, Math.min(1, this.y)),
            Math.max(0, Math.min(1, this.z))
        );
    }

    // Convert color to RGBA string for Canvas
    toRGBA(): string {
        const r = Math.floor(this.x * 255);
        const g = Math.floor(this.y * 255);
        const b = Math.floor(this.z * 255);
        return `rgba(${r},${g},${b},255)`;
    }
}
