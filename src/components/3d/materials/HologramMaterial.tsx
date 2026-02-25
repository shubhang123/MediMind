"use client";

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface HologramMaterialProps {
    color?: string;
    opacity?: number;
    emissive?: string;
    emissiveIntensity?: number;
    wireframe?: boolean;
}

// A custom shader-based material that gives a technological hologram look
export function HologramMaterial({
    color = '#00D4B8',
    opacity = 0.6,
    emissive = '#00D4B8',
    emissiveIntensity = 0.5,
    wireframe = false
}: HologramMaterialProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
        () => ({
            time: { value: 0 },
            color: { value: new THREE.Color(color) },
            opacity: { value: opacity },
            emissive: { value: new THREE.Color(emissive) },
            emissiveIntensity: { value: emissiveIntensity }
        }),
        [color, opacity, emissive, emissiveIntensity]
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform vec3 emissive;
    uniform float emissiveIntensity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // Fresnel effect for holographic rim lighting
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      rim = smoothstep(0.6, 1.0, rim);

      // Scanlines effect
      float scanline = sin(vPosition.y * 50.0 - time * 5.0) * 0.5 + 0.5;
      scanline = smoothstep(0.4, 0.6, scanline);
      
      // Combine effects
      vec3 baseColor = color * (0.8 + 0.2 * scanline);
      vec3 finalColor = baseColor + (emissive * emissiveIntensity * rim);
      
      // Calculate final alpha with subtle pulsing
      float pulse = sin(time * 2.0) * 0.1 + 0.9;
      float finalAlpha = opacity * pulse * (0.5 + 0.5 * rim);

      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
            depthWrite={false}
            wireframe={wireframe}
            blending={THREE.AdditiveBlending}
        />
    );
}
