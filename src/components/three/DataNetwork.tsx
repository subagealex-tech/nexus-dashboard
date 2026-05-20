"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function NetworkNodes() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const nodeCount = 30;

  const { positions, linePositions } = useMemo(() => {
    const pos: number[] = [];
    const linePos: number[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 5 - 2;
      pos.push(x, y, z);

      for (let j = i + 1; j < nodeCount; j++) {
        const x2 = (Math.random() - 0.5) * 15;
        const y2 = (Math.random() - 0.5) * 15;
        const z2 = (Math.random() - 0.5) * 5 - 2;
        
        const dist = Math.sqrt(
          Math.pow(x - x2, 2) + Math.pow(y - y2, 2) + Math.pow(z - z2, 2)
        );
        
        if (dist < 4) {
          linePos.push(x, y, z, x2, y2, z2);
        }
      }
    }

    return {
      positions: new Float32Array(pos),
      linePositions: new Float32Array(linePos),
    };
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#00f5d4"
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#9b5de5"
          transparent
          opacity={0.3}
        />
      </lineSegments>
    </group>
  );
}

function DataStream() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = -5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#f15bb5"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0a0a0f"]} />
      <fog attach="fog" args={["#0a0a0f", 3, 15]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#00f5d4" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#9b5de5" />

      <NetworkNodes />
      <DataStream />
    </>
  );
}

export default function DataNetwork() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}