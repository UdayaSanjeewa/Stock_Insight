'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Building3DProps {
  position: [number, number, number];
  height: number;
  color: string;
  symbol: string;
  price: number;
  changePercent: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function Building3D({
  position,
  height,
  color,
  symbol,
  price,
  changePercent,
  isSelected,
  onClick
}: Building3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && (hovered || isSelected)) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        position[1] + 0.3,
        0.1
      );
    } else if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        position[1],
        0.1
      );
    }
  });

  const windowsCount = Math.floor(height / 0.5);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={isSelected ? '#3b82f6' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>

      {Array.from({ length: windowsCount }).map((_, i) => {
        const rows = 4;
        const cols = 4;
        const windows = [];

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const windowY = (-height / 2) + (i * 0.5) + 0.25;
            const windowX = -0.3 + (col * 0.2);
            const windowZ = 0.51;

            windows.push(
              <mesh
                key={`${i}-${row}-${col}-front`}
                position={[windowX, windowY, windowZ]}
              >
                <planeGeometry args={[0.08, 0.15]} />
                <meshBasicMaterial color="#ffeb3b" opacity={0.8} transparent />
              </mesh>
            );

            windows.push(
              <mesh
                key={`${i}-${row}-${col}-side`}
                position={[windowZ, windowY, windowX]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[0.08, 0.15]} />
                <meshBasicMaterial color="#ffeb3b" opacity={0.6} transparent />
              </mesh>
            );
          }
        }

        return windows;
      })}

      <mesh position={[0, -height / 2 - 0.05, 0]}>
        <boxGeometry args={[1.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}
