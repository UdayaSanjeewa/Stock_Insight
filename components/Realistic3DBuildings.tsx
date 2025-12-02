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

function Tree({ position, size = 1 }: { position: [number, number, number], size?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.15, size * 0.6, 8]} />
        <meshStandardMaterial color="#8b5a3c" roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <coneGeometry args={[size * 0.4, size * 0.8, 8]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.2, 0]} castShadow>
        <coneGeometry args={[size * 0.35, size * 0.6, 8]} />
        <meshStandardMaterial color="#365e1f" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.5, 0]} castShadow>
        <coneGeometry args={[size * 0.3, size * 0.5, 8]} />
        <meshStandardMaterial color="#4a7c2c" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Cloud({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5 * scale, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.4 * scale, 0.1 * scale, 0]}>
        <sphereGeometry args={[0.4 * scale, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-0.4 * scale, 0, 0]}>
        <sphereGeometry args={[0.35 * scale, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3 * scale, 0]}>
        <sphereGeometry args={[0.3 * scale, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Road({ start, end, width = 1.5 }: { start: [number, number], end: [number, number], width?: number }) {
  const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[1] + end[1]) / 2;

  return (
    <group position={[midX, 0.02, midZ]} rotation={[0, angle, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[length, 0.05, width]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[length, 0.01, 0.1]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function StreetLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.3, 2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.3, 2.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight position={[0.3, 2.3, 0]} intensity={2} distance={5} color="#fbbf24" />
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

  const trees = useMemo(() => {
    const treePositions: Array<[number, number, number]> = [];
    const roadWidth = buildings.length * 2.5;

    for (let i = -6; i <= 6; i++) {
      if (Math.abs(i * 2) < roadWidth) continue;
      treePositions.push([i * 2, 0, -8]);
      treePositions.push([i * 2, 0, 8]);
    }

    for (let i = -3; i <= 3; i++) {
      treePositions.push([-roadWidth / 2 - 3, 0, i * 3]);
      treePositions.push([roadWidth / 2 + 3, 0, i * 3]);
    }

    return treePositions;
  }, [buildings.length]);

  const clouds = useMemo(() => {
    return [
      { position: [-8, 10, -5] as [number, number, number], scale: 1.5 },
      { position: [6, 11, -8] as [number, number, number], scale: 1.2 },
      { position: [-3, 12, 10] as [number, number, number], scale: 1.8 },
      { position: [10, 10, 5] as [number, number, number], scale: 1.3 },
      { position: [0, 13, -12] as [number, number, number], scale: 1.6 },
    ];
  }, []);

  const roads = useMemo(() => {
    const roadWidth = buildings.length * 2.5 + 4;
    return [
      { start: [-roadWidth / 2, 0] as [number, number], end: [roadWidth / 2, 0] as [number, number], width: 1.8 },
      { start: [-roadWidth / 2, -3] as [number, number], end: [roadWidth / 2, -3] as [number, number], width: 1.5 },
      { start: [-roadWidth / 2, 3] as [number, number], end: [roadWidth / 2, 3] as [number, number], width: 1.5 },
    ];
  }, [buildings.length]);

  const streetLights = useMemo(() => {
    const roadWidth = buildings.length * 2.5;
    const positions: Array<[number, number, number]> = [];

    for (let i = -3; i <= 3; i++) {
      positions.push([i * 4, 0, -3.5]);
      positions.push([i * 4, 0, 3.5]);
    }

    return positions;
  }, [buildings.length]);

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

      <ambientLight intensity={0.5} />
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
      <hemisphereLight args={['#87CEEB', '#8B7355', 0.6]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#7cb342" roughness={0.9} />
      </mesh>

      {roads.map((road, index) => (
        <Road key={`road-${index}`} {...road} />
      ))}

      {buildings.map((building, index) => (
        <Building key={index} {...building} />
      ))}

      {trees.map((position, index) => (
        <Tree key={`tree-${index}`} position={position} size={0.8 + Math.random() * 0.4} />
      ))}

      {streetLights.map((position, index) => (
        <StreetLight key={`light-${index}`} position={position} />
      ))}

      {clouds.map((cloud, index) => (
        <Cloud key={`cloud-${index}`} position={cloud.position} scale={cloud.scale} />
      ))}

      <fog attach="fog" args={['#b3d9ff', 20, 40]} />
    </>
  );
}

export default function Realistic3DBuildings({ data }: Realistic3DBuildingsProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows gl={{ antialias: true, alpha: true }} camera={{ position: [0, 8, 16], fov: 55 }}>
        <color attach="background" args={['#87CEEB']} />
        <Scene data={data} />
      </Canvas>
    </div>
  );
}
