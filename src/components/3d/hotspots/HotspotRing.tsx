"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { DiagnosticHotspot } from '../types';

interface HotspotProps {
    data: DiagnosticHotspot;
    position: [number, number, number];
    onClick?: (data: DiagnosticHotspot) => void;
}

export function HotspotRing({ data, position, onClick }: HotspotProps) {
    const groupRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Colors based on severity
    const color = data.severity > 0.8 ? '#EF4444' : data.severity > 0.4 ? '#F59E0B' : '#10B981';
    const pulseSpeed = data.severity > 0.8 ? 5 : 2;

    useFrame((state) => {
        if (ringRef.current) {
            // Pulse animation
            const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1;
            ringRef.current.scale.set(scale, scale, scale);

            // Rotate ring to face camera but keep upright
            ringRef.current.lookAt(state.camera.position);
        }
    });

    return (
        <group
            ref={groupRef}
            position={position}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
            onClick={(e) => { e.stopPropagation(); onClick?.(data); }}
        >
            <mesh ref={ringRef}>
                <ringGeometry args={[0.15, 0.2, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={hovered ? 0.9 : 0.6}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Inner dot */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>

            {/* Label appears on hover */}
            {hovered && data.label && (
                <Text
                    position={[0, 0.3, 0]}
                    fontSize={0.1}
                    color="#FFF"
                    anchorX="center"
                    anchorY="bottom"
                    outlineColor="#000"
                    outlineWidth={0.01}
                >
                    {data.label}
                </Text>
            )}
        </group>
    );
}
