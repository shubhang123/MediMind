"use client";

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function VolumetricFog() {
    // Simple fog added to scene via react-three-fiber approach
    // We can just add a global fog component or post-processing here.
    // Due to SSR/Next.js constraints, we keep it simple for now:
    return <fog attach="fog" args={['#0A0E1A', 5, 20]} />;
}

// Particle system for ambient medical "wisps"
export function DataWisps({ count = 100, color = "#00D4B8" }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            ),
            speed: Math.random() * 0.02 + 0.01,
            factor: Math.random() * Math.PI * 2,
        }));
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        particles.forEach((particle, i) => {
            let t = state.clock.elapsedTime * particle.speed + particle.factor;

            dummy.position.x = particle.pos.x + Math.sin(t) * 0.5;
            dummy.position.y = particle.pos.y + Math.cos(t * 0.8) * 0.5;
            dummy.position.z = particle.pos.z + Math.sin(t * 1.2) * 0.5;

            const scale = 0.5 + Math.sin(t * 4) * 0.2;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();

            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
}
