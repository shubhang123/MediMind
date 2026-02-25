"use client";

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { BrainHologramProps } from './types';
import { HologramMaterial } from './materials/HologramMaterial';
import { VolumetricFog, DataWisps } from './effects/VolumetricFog';
import { NeuralSparks } from './particles/NeuralSparks';
import { HotspotRing } from './hotspots/HotspotRing';

function generateBrainPoints(count = 20000) {
    const points = [];
    while (points.length < count) {
        const x = (Math.random() - 0.5) * 2.2;
        const y = (Math.random() - 0.5) * 1.8;
        const z = (Math.random() - 0.5) * 2.6;

        // Base ellipsoid (overall shape)
        const d = (x * x) / (1.1 * 1.1) + (y * y) / (0.9 * 0.9) + (z * z) / (1.3 * 1.3);

        // create folds (sulci/gyri) using sine waves
        const folds =
            Math.sin(x * 12) * Math.cos(y * 12) * Math.sin(z * 12) * 0.08 +
            Math.sin(x * 6) * Math.cos(y * 6) * Math.sin(z * 6) * 0.15;

        // Longitudinal fissure (cleft between hemispheres)
        const fissure = Math.abs(x) < 0.15 ? 0.4 : 0;

        // temporal lobes bulge a bit
        const temporal = (y < -0.2 && Math.abs(x) > 0.6 && z > 0 && z < 1.0) ? -0.2 : 0;

        // Cerebellum at bottom back
        const cerebellum = (y < -0.6 && Math.abs(x) < 0.8 && z < -0.4) ? -0.3 : 0;

        // Make it a thick shell rather than entirely solid, to look more holographic
        const isCore = d < 0.2;

        if (d + folds + fissure + temporal + cerebellum < 1.0 && !isCore) {
            points.push(new THREE.Vector3(x, y, z));
        }
    }
    return points;
}

// Global cache for the 25,000 point array to prevent recalculation on remounts
let cachedBrainPoints: THREE.Vector3[] = [];
function getCachedBrainPoints(count = 25000): THREE.Vector3[] {
    if (cachedBrainPoints.length === 0) {
        cachedBrainPoints = generateBrainPoints(count);
    }
    return cachedBrainPoints;
}

// Procedural Neural Point Cloud Brain
const BrainModel = ({ mode }: { mode: BrainHologramProps['mode'] }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Generate static point cloud data from global cache
    const [pointsData] = useState(() => getCachedBrainPoints(25000));

    // Flatten for buffer geometry
    const positions = useMemo(() => {
        const pos = new Float32Array(pointsData.length * 3);
        pointsData.forEach((p, i) => {
            pos[i * 3] = p.x;
            pos[i * 3 + 1] = p.y;
            pos[i * 3 + 2] = p.z;
        });
        return pos;
    }, [pointsData]);

    // Random attributes for organic particle twinkling
    const randoms = useMemo(() => {
        const r = new Float32Array(pointsData.length);
        for (let i = 0; i < pointsData.length; i++) r[i] = Math.random();
        return r;
    }, [pointsData]);

    useFrame((state) => {
        if (pointsRef.current) {
            // Idle rotation
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;

            // Mode specific transforms
            if (mode === 'listening') {
                pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.02;
            } else {
                pointsRef.current.position.set(0, 0, 0);
            }
        }
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    const materialColor = mode === 'listening' ? '#3B82F6' : // Blue
        mode === 'analyzing' ? '#8B5CF6' : // Purple
            mode === 'diagnostic' ? '#EF4444' : // Red
                mode === 'report_ready' ? '#10B981' : // Green
                    '#00D4B8'; // MediMind Teal

    const uniforms = useMemo(
        () => ({
            time: { value: 0 },
            color: { value: new THREE.Color(materialColor) },
            modeIndex: { value: mode === 'analyzing' ? 1 : mode === 'listening' ? 2 : 0 }
        }),
        [materialColor, mode]
    );

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={uniforms}
                vertexShader={`
                    uniform float time;
                    uniform int modeIndex;
                    attribute float aRandom;
                    varying float vAlpha;
                    
                    void main() {
                        vec3 pos = position;
                        
                        // Default particle rules
                        float pointSize = 2.0;
                        vAlpha = 0.4 + aRandom * 0.4;
                        
                        if (modeIndex == 1) { 
                             // Analyzing: rapid pulsing data scanlines
                             float scan = sin(pos.y * 10.0 - time * 5.0) * 0.5 + 0.5;
                             pointSize += scan * 2.5;
                             vAlpha *= (0.5 + scan);
                             // Add slight jitter
                             pos.x += sin(time * 20.0 + aRandom * 10.0) * 0.01;
                        } else if (modeIndex == 2) { 
                             // Listening: reactive energetic bounce
                             float energy = sin(time * 4.0 + aRandom * 6.28) * 0.5 + 0.5;
                             pointSize += energy * 2.0;
                             vAlpha = vAlpha * (0.8 + energy * 0.5);
                        } else {
                             // Idle: gentle breathing
                             float breathe = sin(time * 1.5 + aRandom * 6.28) * 0.5 + 0.5;
                             pointSize += breathe * 1.0;
                             vAlpha = vAlpha * (0.6 + breathe * 0.4);
                        }
                        
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        // Size attenuation
                        gl_PointSize = pointSize * (8.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `}
                fragmentShader={`
                    uniform vec3 color;
                    varying float vAlpha;
                    void main() {
                        // Create a soft glowing circle or "neural node"
                        vec2 coord = gl_PointCoord - vec2(0.5);
                        float dist = length(coord);
                        if (dist > 0.5) discard;
                        
                        float alpha = (0.5 - dist) * 2.0 * vAlpha;
                        
                        // Brighter core
                        vec3 finalColor = color + vec3(0.5) * (1.0 - dist * 2.0);
                        
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `}
            />
        </points>
    );
};

export const BrainHologram: React.FC<BrainHologramProps> = ({
    mode = 'idle',
    size = 'md',
    hotspots = [],
    className,
    interactive = true
}) => {

    const sizeMap = {
        sm: { width: 200, height: 200 },
        md: { width: 400, height: 400 },
        lg: { width: 600, height: 600 },
        xl: { width: '100vw', height: '100vh' }
    };

    const currentSize = sizeMap[size];

    // Map hotspot regions to approximate 3D coordinates on our abstract shape
    const getRegionPosition = (region: string): [number, number, number] => {
        switch (region) {
            case 'frontal': return [0, 0.5, 1];
            case 'temporal': return [1.2, 0, 0];
            case 'parietal': return [0, 1, -0.2];
            case 'occipital': return [0, -0.2, -1.2];
            case 'cerebellum': return [0, -0.8, -0.8];
            default: return [0, 0, 0];
        }
    };

    return (
        <div className={className} style={{ ...currentSize, position: 'relative' }}>
            {/* Fallback spinner would go here */}
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-teal-500">Initializing Core...</div>}>
                <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00D4B8" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />

                    {/* Core Model */}
                    <BrainModel mode={mode} />

                    {/* Effects */}
                    <VolumetricFog />
                    {mode === 'idle' && <DataWisps count={50} />}
                    <NeuralSparks active={mode === 'analyzing' || mode === 'focused'} />

                    {/* Diagnostic Hotspots */}
                    {(mode === 'diagnostic' || mode === 'focused') && hotspots.map((hotspot, idx) => (
                        <HotspotRing
                            key={idx}
                            data={hotspot}
                            position={getRegionPosition(hotspot.region)}
                        />
                    ))}

                    {/* Interaction */}
                    {interactive && (
                        <OrbitControls
                            enableZoom={size === 'xl'}
                            enablePan={false}
                            autoRotate={mode === 'idle'}
                            autoRotateSpeed={0.5}
                            minDistance={2}
                            maxDistance={5}
                        />
                    )}
                </Canvas>
            </Suspense>
        </div>
    );
};

export default BrainHologram;
