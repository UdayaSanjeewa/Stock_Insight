'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface BuildingData {
  label: string;
  value: number;
  change: number;
  color: string;
}

interface Realistic3DBuildingsProps {
  data: BuildingData[];
}

function Window({ position, size = 0.08 }: { position: [number, number, number], size?: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[size, size, 0.02]} />
      <meshStandardMaterial
        color="#fef3c7"
        emissive="#fbbf24"
        emissiveIntensity={0.5}
        roughness={0.2}
      />
    </mesh>
  );
}

function Building({
  height,
  position,
  color,
  label,
  value,
  change
}: {
  height: number;
  position: [number, number, number];
  color: string;
  label: string;
  value: number;
  change: number;
}) {
  const depth = 1.5;
  const width = 1.5;

  const geometry = useMemo(() => new THREE.BoxGeometry(width, height, depth), [height]);

  const mainColor = color;

  const lightColor = new THREE.Color(mainColor).multiplyScalar(1.2);
  const darkColor = new THREE.Color(mainColor).multiplyScalar(0.6);

  const windows = useMemo(() => {
    const windowList: JSX.Element[] = [];
    const windowSize = 0.08;
    const windowSpacing = 0.25;
    const rows = Math.floor(height / windowSpacing) - 1;
    const cols = 4;
    const startY = -height / 2 + windowSpacing;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - 1.5) * windowSpacing;
        const y = startY + row * windowSpacing;

        windowList.push(
          <Window
            key={`front-${row}-${col}`}
            position={[x, y, depth / 2 + 0.01]}
            size={windowSize}
          />
        );
        windowList.push(
          <Window
            key={`back-${row}-${col}`}
            position={[x, y, -depth / 2 - 0.01]}
            size={windowSize}
          />
        );
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const z = (col - 1.5) * windowSpacing;
        const y = startY + row * windowSpacing;

        windowList.push(
          <Window
            key={`left-${row}-${col}`}
            position={[-width / 2 - 0.01, y, z]}
            size={windowSize}
          />
        );
        windowList.push(
          <Window
            key={`right-${row}-${col}`}
            position={[width / 2 + 0.01, y, z]}
            size={windowSize}
          />
        );
      }
    }

    return windowList;
  }, [height, width, depth]);

  return (
    <group position={position}>
      <mesh geometry={geometry} position={[0, height / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={mainColor}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      <mesh position={[width / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.01, height, depth]} />
        <meshStandardMaterial color={lightColor.getHex()} />
      </mesh>

      <mesh position={[-width / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.01, height, depth]} />
        <meshStandardMaterial color={darkColor.getHex()} />
      </mesh>

      <mesh position={[0, height / 2, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.01]} />
        <meshStandardMaterial color={new THREE.Color(mainColor).multiplyScalar(0.8).getHex()} />
      </mesh>

      <mesh position={[0, height / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.01]} />
        <meshStandardMaterial color={darkColor.getHex()} />
      </mesh>

      {windows}

      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>

      <Text
        position={[0, height + 0.1, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        ${value.toFixed(2)}
      </Text>

      <Text
        position={[0, height - 0.2, 0]}
        fontSize={0.2}
        color={change >= 0 ? '#10b981' : '#ef4444'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#000000"
      >
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </Text>
    </group>
  );
}

function Scene({ data }: { data: BuildingData[] }) {
  const maxValue = Math.max(...data.map(d => d.value));

  const stockColors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1'
  ];

  const buildings = useMemo(() => {
    return data.map((item, index) => {
      const normalizedHeight = (item.value / maxValue) * 5 + 1;
      const spacing = 2.5;
      const totalWidth = (data.length - 1) * spacing;
      const xPosition = index * spacing - totalWidth / 2;

      return {
        height: normalizedHeight,
        position: [xPosition, 0, 0] as [number, number, number],
        color: stockColors[index % stockColors.length],
        label: item.label,
        value: item.value,
        change: item.change,
      };
    });
  }, [data, maxValue]);

  return (
    <>
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={12}
        maxDistance={30}
        target={[0, 2, 0]}
      />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-5, 10, -5]} intensity={0.5} />
      <hemisphereLight args={['#ffffff', '#444444', 0.4]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.8} />
      </mesh>

      {buildings.map((building, index) => (
        <Building key={index} {...building} />
      ))}

      <fog attach="fog" args={['#f3f4f6', 15, 35]} />
    </>
  );
}

export default function Realistic3DBuildings({ data }: Realistic3DBuildingsProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows gl={{ antialias: true, alpha: true }} camera={{ position: [0, 6, 14], fov: 55 }}>
        <color attach="background" args={['#f9fafb']} />
        <Scene data={data} />
      </Canvas>
    </div>
  );
}
