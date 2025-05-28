
import { Color } from './geometry/math';
import { Ray } from './ray';
import { Intersection} from './interface/interfaces';
import { Scene } from './scene/scene';
import { Camera } from './scene/camera';


export class Raytracer {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    scene: Scene;
    camera: Camera;
    maxDepth: number;
    imageData: ImageData;
    
    onRenderComplete: () => void;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scene: Scene, camera: Camera, onRenderComplete: () => void) {
        if (!canvas || !ctx || !scene || !camera) {
            throw new Error("Invalid parameters provided to Raytracer constructor.");
        }
        this.canvas = canvas;
        this.ctx = ctx;
        this.scene = scene;
        this.camera = camera;
        this.maxDepth = 4; // Max reflection depth
        this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        this.onRenderComplete = onRenderComplete;
    }

    // M rendering the scene  ======
    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const aspectRatio = width / height;

        const renderLoop = (yStart: number, yEnd: number) => {
            for (let y = yStart; y < yEnd; y++) {
                for (let x = 0; x < width; x++) {
                    const u = x / (width - 1);
                    const v = y / (height - 1);

                    const ray = this.camera.generateRay(u, v, aspectRatio);
                    const color = this.traceRay(ray, this.maxDepth);
                    this.setPixel(x, y, color);
                }
            }
            this.ctx.putImageData(this.imageData, 0, 0); // Update canvas after each block =====
        };

        const blockSize = 50; // Render in blocks of 50 rows
        let currentY = 0;

        const animateRender = () => {
            if (currentY < height) {
                const nextY = Math.min(currentY + blockSize, height);
                renderLoop(currentY, nextY);
                currentY = nextY;
                requestAnimationFrame(animateRender);
            } else {
                // Rendering finished
                this.onRenderComplete();
            }
        };

        requestAnimationFrame(animateRender);
    }

    // Traces a ray , returns the pixel color
    traceRay(ray: Ray, depth: number): Color {
        
        if (depth <= 0) {
            return new Color(0, 0, 0); // Maximum reflection depth reached, return black
        }

        let closestIntersection: Intersection | null = null;
        for (const obj of this.scene.objects) {
            const intersection = obj.intersect(ray);
            if (intersection && (!closestIntersection || intersection.distance < closestIntersection.distance)) {
                closestIntersection = intersection;
            }
        }

        if (closestIntersection) {
            const hitColor = this.shade(closestIntersection, ray, depth);
            return hitColor;
        } else {
            // Background color (sky - gradient)
            const t = 0.5 * (ray.direction.y + 1.0);
            return new Color(1.0, 1.0, 1.0).multiplyScalar(1.0 - t).add(new Color(0.5, 0.7, 1.0).multiplyScalar(t)) as Color;
        }
    }

    // Calculates the color at the intersection point considering lighting and material

    shade(intersection: Intersection, ray: Ray, depth: number): Color {
        const material = intersection.object.material;
        const hitPoint = intersection.point;
        const normal = intersection.normal;

        // Ambient lighting
        let finalColor: Color = material.color.multiplyScalar(material.ambient).multiply(this.scene.ambientLight) as Color;

        for (const light of this.scene.lights) {
            const lightDir = light.position.subtract(hitPoint).normalize();
            const lightDistance = light.position.subtract(hitPoint).length();
            // Offset the intersection point slightly along the normal to prevent self-shadowing
            const shadowRay = new Ray(hitPoint.add(normal.multiplyScalar(0.001)), lightDir);

            // Shadow check
            let inShadow = false;
            for (const obj of this.scene.objects) {
                const shadowIntersection = obj.intersect(shadowRay);
                // If the ray to the light hits another object before the light, it's in shadow
                if (shadowIntersection && shadowIntersection.distance < lightDistance) {
                    inShadow = true;
                    break;
                }
            }

            if (!inShadow) {
                // Diffuse lighting (Lambertian model)
                const NdotL = Math.max(0, normal.dot(lightDir));
                finalColor = finalColor.add(material.color.multiplyScalar(material.diffuse).multiplyScalar(NdotL).multiply(light.color)) as Color;

                // Specular lighting (Phong model)
                if (material.specular > 0) {
                    // Reflected light direction
                    const reflectDir = lightDir.subtract(normal.multiplyScalar(2 * lightDir.dot(normal))).normalize();
                    // View direction (from point to camera eye)
                    const viewDir = ray.direction.multiplyScalar(-1).normalize(); // Ray.direction points away from camera, so -ray.direction points towards camera
                    const RdotV = Math.max(0, reflectDir.dot(viewDir));
                    const specularFactor = Math.pow(RdotV, material.shininess);
                    finalColor = finalColor.add(light.color.multiplyScalar(material.specular * specularFactor)) as Color;
                }
            }
        }

        // Reflections (recursive traceRay call)
        if (material.reflectivity > 0) {
            // Reflected ray direction
            const reflectDir = ray.direction.subtract(normal.multiplyScalar(2 * ray.direction.dot(normal))).normalize();
            // Offset the intersection point slightly along the normal to prevent self-reflections
            const reflectionRay = new Ray(hitPoint.add(normal.multiplyScalar(0.001)), reflectDir);
            const reflectedColor = this.traceRay(reflectionRay, depth - 1);
            finalColor = finalColor.add(reflectedColor.multiplyScalar(material.reflectivity)) as Color;
        }

        return finalColor.clamp(); // Clamp the final color to valid range
    }

    // Sets pixel color in ImageData
    setPixel(x: number, y: number, color: Color) {
        const index = (y * this.canvas.width + x) * 4;
        this.imageData.data[index] = Math.floor(color.x * 255);
        this.imageData.data[index + 1] = Math.floor(color.y * 255);
        this.imageData.data[index + 2] = Math.floor(color.z * 255);
        this.imageData.data[index + 3] = 255; // Alpha channel (fully opaque)
    }
}
