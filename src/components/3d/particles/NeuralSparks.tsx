"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Fast-moving sparks across the surface for the "analyzing" state
export function NeuralSparks({ count = 200, active = false, color = '#FDE047' }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Create dummy object for instancing
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Init particles near a sphere surface
    const particles = useMemo(() => {
        return Array.from({ length: count }).map(() => {
            // Random point on sphere (approximate brain surface)
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 1.0 + Math.random() * 0.1; // radius matching generic brain size

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            return {
                basePos: new THREE.Vector3(x, y, z),
                speed: Math.random() * 2 + 1,
                offset: Math.random() * Math.PI * 2,
                visible: Math.random() > 0.5 // some are initially hidden
            };
        });
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current || !active) return;

        // Animate opacity and slight movement
        particles.forEach((particle, i) => {
            const t = state.clock.elapsedTime * particle.speed + particle.offset;

            // Sparking effect (rapid flashing)
            const flash = Math.sin(t * 10) > 0.8 ? 1 : 0;

            dummy.position.copy(particle.basePos);

            // Scale down to 0 if not active or not flashing
            const scale = active && flash ? 1 : 0;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color={color} transparent blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
}
