'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
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

  const colorMap: Record<string, string> = {
    green: '#7ed321',
    purple: '#6366f1',
    pink: '#ec4899',
    cyan: '#06b6d4',
    blue: '#3b82f6',
    red: '#ef4444',
  };

  const mainColor = colorMap[color] || '#6366f1';

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
    </group>
  );
}

function Scene({ data }: { data: BuildingData[] }) {
  const maxValue = Math.max(...data.map(d => d.value));

  const buildings = useMemo(() => {
    return data.map((item, index) => {
      const normalizedHeight = (item.value / maxValue) * 6 + 1;
      const spacing = 2.5;
      const totalWidth = (data.length - 1) * spacing;
      const xPosition = index * spacing - totalWidth / 2;

      return {
        height: normalizedHeight,
        position: [xPosition, 0, 0] as [number, number, number],
        color: item.change >= 0 ? 'green' : 'red',
        label: item.label,
        value: item.value,
        change: item.change,
      };
    });
  }, [data, maxValue]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 6, 12]} fov={50} />
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={10}
        maxDistance={25}
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
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#f9fafb']} />
        <Scene data={data} />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 flex justify-around items-center flex-wrap gap-4 pointer-events-none">
        {data.map((item, index) => (
          <div key={index} className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200">
            <div className="font-bold text-sm text-gray-900">{item.label}</div>
            <div className="text-xs text-gray-600 mt-0.5">${item.value.toFixed(2)}</div>
            <div className={`text-xs font-semibold mt-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
