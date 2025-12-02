'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import Building3D from './Building3D';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  sentiment?: number;
}

interface StockCity3DProps {
  stocks: StockData[];
  selectedStock: StockData | null;
  onSelectStock: (stock: StockData) => void;
}

export default function StockCity3D({ stocks, selectedStock, onSelectStock }: StockCity3DProps) {
  const getBuildingHeight = (price: number): number => {
    return Math.max(1, Math.min(8, price / 50));
  };

  const getBuildingColor = (changePercent: number): string => {
    if (changePercent >= 2) return '#10b981';
    if (changePercent >= 0) return '#34d399';
    if (changePercent >= -2) return '#ef4444';
    return '#dc2626';
  };

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={50} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={10}
        maxDistance={25}
        target={[0, 2, 0]}
      />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#60a5fa" />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#f59e0b" />

      <Environment preset="night" />

      {stocks.map((stock, index) => {
        const height = getBuildingHeight(stock.price);
        const color = getBuildingColor(stock.changePercent);
        const xPosition = (index - stocks.length / 2) * 2.5;
        const isSelected = selectedStock?.symbol === stock.symbol;

        return (
          <Building3D
            key={stock.symbol}
            position={[xPosition, height / 2, 0]}
            height={height}
            color={color}
            symbol={stock.symbol}
            price={stock.price}
            changePercent={stock.changePercent}
            isSelected={isSelected}
            onClick={() => onSelectStock(stock)}
          />
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.8} />
      </mesh>

      <fog attach="fog" args={['#0f172a', 10, 30]} />
    </Canvas>
  );
}
