"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingCrystal({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
      position={position}
    >
      <mesh
        ref={meshRef}
        scale={hovered ? scale * 1.1 : scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.1}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.2}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color={color}
          transmission={0.9}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const particleCount = 500;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3);
    const color1 = new THREE.Color("#00f5d4");
    const color2 = new THREE.Color("#9b5de5");
    const color3 = new THREE.Color("#f15bb5");

    for (let i = 0; i < particleCount; i++) {
      const c = Math.random() > 0.66 ? color1 : Math.random() > 0.33 ? color2 : color3;
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return cols;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y += 0.0005;
      points.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function MouseFollower() {
  const { pointer } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = pointer.x * 5;
      meshRef.current.position.y = pointer.y * 5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 5]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshBasicMaterial color="#00f5d4" transparent opacity={0.3} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0a0a0f"]} />
      <fog attach="fog" args={["#0a0a0f", 5, 25]} />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f5d4" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9b5de5" />

      <FloatingCrystal position={[-4, 2, -3]} color="#00f5d4" scale={0.8} />
      <FloatingCrystal position={[3, -1, -4]} color="#9b5de5" scale={1.2} />
      <FloatingCrystal position={[0, 3, -6]} color="#f15bb5" scale={0.6} />
      <FloatingCrystal position={[-3, -2, -5]} color="#fee440" scale={0.5} />
      <FloatingCrystal position={[4, 1, -3]} color="#00f5d4" scale={0.7} />

      <ParticleField />
      <MouseFollower />
    </>
  );
}

export default function BackgroundScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}