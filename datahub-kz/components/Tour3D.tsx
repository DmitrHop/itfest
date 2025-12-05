import React, { useState, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, MapPin } from 'lucide-react';

// Define the locations and their image paths
// Based on the file structure: public/3d-models/iitu/[location]/[image].jpg
// We will use the first image from each folder as the panorama for now, assuming they are 360 images.
// If they are not true seamless 360s, this is a best-effort visualization.
const ALL_LOCATIONS = {
    iitu: [
        {
            id: 'hall',
            name: 'Main Hall',
            description: 'The main entrance and gathering area',
            texturePath: '/3d-models/iitu/hall/0.jpg',
        },
        {
            id: 'mixed_reality',
            name: 'Mixed Reality Lab',
            description: 'Laboratory for VR/AR research',
            texturePath: '/3d-models/iitu/mixed reality lab/0.jpg',
        },
        {
            id: 'ret',
            name: 'RET Lab',
            description: 'Radio Electronics and Telecommunications',
            texturePath: '/3d-models/iitu/РЭТ/0.jpg',
        }
    ],
    narxoz: [
        {
            id: 'hall',
            name: 'Main Atrium',
            description: 'Central hub of the university',
            texturePath: '/3d-models/narxoz/hall/1.png',
        },
        {
            id: 'hub',
            name: 'Student Hub',
            description: 'Coworking and relaxation area',
            texturePath: '/3d-models/narxoz/hub/1.png',
        }
    ],
    aues: [
        {
            id: 'hall',
            name: 'Main Hall',
            description: 'The central entrance area',
            texturePath: '/3d-models/aues/hall/1.png',
        },
        {
            id: 'commission',
            name: 'Admission Commission',
            description: 'Where students apply and register',
            texturePath: '/3d-models/aues/commision/1.png',
        }
    ]
};

function Panorama({ texturePath }: { texturePath: string }) {
    // Load texture using Three.js loader
    // We use Suspense to handle the async loading
    const texture = useLoader(THREE.TextureLoader, texturePath);

    // Configure texture filtering for better quality
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    return (
        <mesh>
            {/* 
        Sphere geometry with radius 500, and 60 segments for smoothness.
        scale={[-1, 1, 1]} inverts the sphere so the texture is on the inside.
      */}
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
    );
}

export function Tour3D({ universityId }: { universityId?: string }) {
    // Default to IITU if no ID provided or not found
    const locations = ALL_LOCATIONS[universityId as keyof typeof ALL_LOCATIONS] || ALL_LOCATIONS['iitu'];

    // Ensure we start with a valid location id from the current set
    const [currentLocationId, setCurrentLocationId] = useState(locations[0]?.id);
    const currentLocation = locations.find(l => l.id === currentLocationId) || locations[0];

    // Reset current location when university changes
    if (locations[0].id !== currentLocationId && !locations.find(l => l.id === currentLocationId)) {
        setCurrentLocationId(locations[0].id);
    }

    return (
        <div className="w-full h-[600px] relative bg-black rounded-2xl overflow-hidden">
            {/* Header / Overlay UI */}
            <div className="absolute top-0 left-0 z-10 p-4 w-full bg-gradient-to-b from-black/70 to-transparent text-white">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{currentLocation.name}</h1>
                        <p className="text-gray-300">{currentLocation.description}</p>
                    </div>

                    {/* Location Selector */}
                    <div className="flex gap-2">
                        {locations.map(loc => (
                            <button
                                key={loc.id}
                                onClick={() => setCurrentLocationId(loc.id)}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentLocationId === loc.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                            >
                                <MapPin size={16} />
                                <span className="hidden sm:inline">{loc.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3D Scene */}
            <div className="w-full h-full">
                <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
                    <OrbitControls
                        enableZoom={true} // Allow zooming
                        enablePan={false} // Disable panning (moving camera position), only rotation
                        enableDamping={true}
                        dampingFactor={0.05}
                        rotateSpeed={-0.5} // Invert rotation for natural feel inside sphere
                    />
                    <Suspense fallback={<Html center><div className="text-white text-xl">Loading environment...</div></Html>}>
                        <Panorama texturePath={currentLocation.texturePath} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Instructions Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white/80 text-sm">
                    Drag to look around • Scroll to zoom
                </div>
            </div>
        </div>
    );
}

export default Tour3D;
