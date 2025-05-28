import React, { useRef, useEffect, useState } from 'react';
import { Vector3, Color } from './geometry/math';
import { Sphere, Plane } from './scene/shapes/objects';
import { Light } from './scene/light';
import { Scene } from './scene/scene';
import { Camera } from './scene/camera';
import { Raytracer } from './raytracer';
import { Material } from './interface/interfaces';


const App: React.FC = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [isRendered, setIsRendered] = useState(false); 

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error("Canvas element not found.");
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("2D rendering context not found.");
            return;
        }

        canvas.width = 800;
        canvas.height = 600;
      
        const scene = new Scene();

        // materials
        const blackMat: Material = { color: new Color(0, 0, 0), ambient: 0.1, diffuse: 0.7, specular: 0.8, shininess: 32, reflectivity: 0.1 };
        const blueMat: Material = { color: new Color(1, 0, 0), ambient: 0.1, diffuse: 0.9, specular: 0.5, shininess: 40, reflectivity: 0.2};
        const greenMat: Material = { color: new Color(0, 1, 0), ambient: 0.1, diffuse: 0.8, specular: 0.6, shininess: 20, reflectivity: 0.3 };
        const mirrorMat: Material = { color: new Color(0.9, 0.9, 0.9), ambient: 0.05, diffuse: 0.05, specular: 0.9, shininess: 128, reflectivity: 0.95 };
        const groundMat: Material = { color: new Color(0.8, 0.8, 0.8), ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 8, reflectivity: 0.2 };
        const glassMat: Material = { color: new Color(0.9, 0.9, 1.0), ambient: 0.05, diffuse: 0.1, specular: 0.8, shininess: 64, reflectivity: 0.8 }; // Glass material

        // scene
        scene.add(new Sphere(new Vector3(0, 1, -5), 1.0, blackMat)); // Black sphere
        scene.add(new Sphere(new Vector3(2, -0.5, -4), 0.5, blueMat));
        scene.add(new Sphere(new Vector3(-2, 0.5, -6), 1.2, greenMat));
        scene.add(new Sphere(new Vector3(0, 2.5, -3), 0.7, mirrorMat)); // Mirror sphere
        scene.add(new Sphere(new Vector3(-1.5, -0.7, -3), 0.3, glassMat)); // Glass sphere
        // floor
        scene.add(new Plane(new Vector3(0, -1, 0), new Vector3(0, 1, 0), groundMat));
        // Lights 
        scene.addLight(new Light(new Vector3(5, 5, 5), new Color(1, 1, 1))); // White light
        scene.addLight(new Light(new Vector3(-5, 3, -2), new Color(0.5, 0.5, 0.8))); // Bluish light

        // Camera
        const camera = new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, -1), 70);

      
        const handleRenderComplete = () => {
            setIsLoading(false);
            setIsRendered(true); 
        };

      
        const raytracer = new Raytracer(canvas, ctx, scene, camera, handleRenderComplete);
        raytracer.render();

    }, []); 


    const handleDownloadImage = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            const link = document.createElement('a');
            link.download = 'raytracer_output.png';
            link.href = image;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-4xl w-full">
                <h1 className="text-2xl font-bold mb-4 text-white">Canvas Raytracer</h1>
                <p className="mb-6 text-gray-300">                
                    Rendering may take a while.
                </p>
                {isLoading && (
                    <div id="loadingMessage" className="flex items-center justify-center mb-4 text-lg text-blue-400">
                        <div className="loading-spinner mr-3"></div>
                        Rendering scene image...
                    </div>
                )}
                <canvas ref={canvasRef} id="raytracerCanvas" className="w-full h-auto"></canvas>

                {isRendered && (
                    <div className="mt-6 ">
                        <p>Rendering complete!</p>
                    <button
                        onClick={handleDownloadImage}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
                    >Download Image   
                    </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;