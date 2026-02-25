"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import dynamic from "next/dynamic";
import React from "react";
import { colors } from "@/lib/design-tokens";

/* ── BrainMesh: procedural sphere with brain-like surface ── */
function BrainMesh({
  mousePosition,
  scrollProgress,
}: {
  mousePosition: { x: number; y: number };
  scrollProgress: any;
}) {
  const brainRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const brainGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(
        positions[i],
        positions[i + 1],
        positions[i + 2]
      );
      const noise =
        Math.sin(vertex.x * 3) *
        Math.cos(vertex.y * 3) *
        Math.sin(vertex.z * 3) *
        0.2;
      vertex.multiplyScalar(1 + noise);
      positions[i] = vertex.x;
      positions[i + 1] = vertex.y;
      positions[i + 2] = vertex.z;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.x = mousePosition.y * 0.3;
      brainRef.current.rotation.y =
        mousePosition.x * 0.3 + state.clock.elapsedTime * 0.15;

      brainRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.25;

      const scrollScale = 1 + (scrollProgress?.get() || 0) * 0.5;
      brainRef.current.scale.setScalar(scrollScale);

      if (brainRef.current.material instanceof THREE.MeshStandardMaterial) {
        brainRef.current.material.emissiveIntensity = hovered ? 0.35 : 0.15;
      }
    }
  });

  return (
    <group>
      <mesh
        ref={brainRef}
        geometry={brainGeometry}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={colors.teal}
          roughness={0.25}
          metalness={0.85}
          emissive={colors.teal}
          emissiveIntensity={0.15}
          transparent
          opacity={0.88}
        />
      </mesh>

      <NeuralConnections />
      <ParticleWisps />
    </group>
  );
}

/* ── NeuralConnections: network lines between random orbital points ── */
function NeuralConnections() {
  const connectionsRef = useRef<THREE.Group>(null!);

  const connections = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const conns: [THREE.Vector3, THREE.Vector3][] = [];

    for (let i = 0; i < 50; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 2.5 + Math.random() * 1;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      points.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].distanceTo(points[j]) < 2) {
          conns.push([points[i], points[j]]);
        }
      }
    }

    return conns;
  }, []);

  useFrame((state) => {
    if (connectionsRef.current) {
      connectionsRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={connectionsRef}>
      {connections.map((connection, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes.position"
              args={[
                new Float32Array([
                  connection[0].x,
                  connection[0].y,
                  connection[0].z,
                  connection[1].x,
                  connection[1].y,
                  connection[1].z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={colors.teal} opacity={0.2} transparent />
        </line>
      ))}
    </group>
  );
}

/* ── ParticleWisps: ambient floating particles ── */
function ParticleWisps() {
  const particlesRef = useRef<THREE.Points>(null!);

  const { positions, sizes } = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 3 + Math.random() * 3;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      sizes[i] = Math.random() * 3 + 0.5;
    }

    return { positions, sizes };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      particlesRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes.position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes.size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={colors.teal}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ── BrainPointCloudModel: GLB model with teal hologram look ── */
interface BrainPointCloudModelProps {
  scale?: [number, number, number];
}

export function BrainPointCloudModel({
  scale = [100, 100, 100],
}: BrainPointCloudModelProps) {
  const { scene } = useGLTF("/models/brain_hologram.glb");

  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
        color: colors.teal,
        roughness: 0.1,
        metalness: 0.85,
        emissive: colors.teal,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.8,
      });
    }
  });

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.4} color={colors.teal} />
        <pointLight position={[5, 5, 5]} intensity={0.2} color={colors.info} />

        <primitive object={scene} scale={scale} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}

/* ── Brain3DCanvas: wrapped procedural brain with full scene ── */
function Brain3DCanvas({
  mousePosition,
  scrollProgress,
}: {
  mousePosition: { x: number; y: number };
  scrollProgress: any;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      className="cursor-grab active:cursor-grabbing"
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color={colors.teal} />
      <pointLight position={[5, 5, 5]} intensity={0.2} color={colors.info} />

      <BrainMesh mousePosition={mousePosition} scrollProgress={scrollProgress} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}

/* ── Dynamic imports for client-only rendering ── */
const DynamicBrain3DCanvas = dynamic(() => Promise.resolve(Brain3DCanvas), {
  ssr: false,
});

const NonSSRWrapper = (props: { children: React.ReactNode }) => (
  <React.Fragment>{props.children}</React.Fragment>
);

const DynamicNonSSRWrapper = dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false,
});

const DynamicBrainPointCloudModel = dynamic(
  () => Promise.resolve(BrainPointCloudModel),
  { ssr: false }
);

export { DynamicBrainPointCloudModel };

function BrainModel3D({
  mousePosition,
  scrollProgress,
}: {
  mousePosition: { x: number; y: number };
  scrollProgress: any;
}) {
  return (
    <DynamicBrain3DCanvas
      mousePosition={mousePosition}
      scrollProgress={scrollProgress}
    />
  );
}

const BrainModel3DClientOnly = (props: {
  mousePosition: { x: number; y: number };
  scrollProgress: any;
}) => (
  <DynamicNonSSRWrapper>
    <BrainModel3D {...props} />
  </DynamicNonSSRWrapper>
);

export default BrainModel3DClientOnly;
