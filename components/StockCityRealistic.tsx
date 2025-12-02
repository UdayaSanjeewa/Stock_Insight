'use client';

import { useState } from 'react';
import Realistic3DBuildings from './Realistic3DBuildings';

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
  secondaryLabel?: string;
}

interface StockCityRealisticProps {
  data: ChartDataPoint[];
  title: string;
  maxValue?: number;
  use3D?: boolean;
}

export default function StockCityRealistic({ data, title, maxValue, use3D = true }: StockCityRealisticProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState({ x: -25, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const max = maxValue || Math.max(...data.map(d => d.value));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotation(prev => ({
      x: Math.max(-60, Math.min(-10, prev.x - deltaY * 0.3)),
      y: prev.y + deltaX * 0.3
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const buildingStyles = [
    { type: 'modern', segments: 1 },
    { type: 'stepped', segments: 3 },
    { type: 'classic', segments: 1 },
    { type: 'tower', segments: 1 },
    { type: 'tiered', segments: 2 }
  ];

  const getBuildingStyle = (index: number) => buildingStyles[index % buildingStyles.length];

  if (use3D) {
    const transformedData = data.map(item => ({
      label: item.label,
      value: item.value,
      change: parseFloat(item.sublabel?.replace('%', '') || '0'),
      color: item.color
    }));

    return (
      <div className="w-full h-full flex flex-col">
        <div className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
          {title}
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
          <Realistic3DBuildings data={transformedData} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
        {title}
      </div>

      <div
        className="flex-1 flex items-center justify-center relative bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-2xl"
        style={{ perspective: '2500px', overflow: 'visible' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative transition-transform duration-200"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(-50px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Circular Road Base */}
          <div
            className="absolute"
            style={{
              width: '800px',
              height: '800px',
              transform: 'translateZ(-20px) translateY(220px)',
              transformStyle: 'preserve-3d',
              left: '50%',
              marginLeft: '-400px',
            }}
          >
            {/* Outer road ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, transparent 65%, #3f3f46 65%, #3f3f46 75%, #27272a 75%, #27272a 85%, transparent 85%)',
                transform: 'rotateX(90deg)',
                boxShadow: '0 -20px 100px rgba(0,0,0,0.8)',
              }}
            >
              {/* Road markings */}
              <div className="absolute inset-0 rounded-full" style={{
                background: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 8deg, #fbbf24 8deg, #fbbf24 9deg)',
                clipPath: 'circle(70% at 50% 50%)',
                maskImage: 'radial-gradient(circle, transparent 65%, black 65%, black 75%, transparent 75%)',
              }} />
            </div>

            {/* Center platform */}
            <div
              className="absolute rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"
              style={{
                width: '520px',
                height: '520px',
                left: '50%',
                top: '50%',
                marginLeft: '-260px',
                marginTop: '-260px',
                transform: 'rotateX(90deg) translateZ(5px)',
                boxShadow: 'inset 0 10px 50px rgba(0,0,0,0.8)',
              }}
            >
              {/* Grid pattern */}
              <div className="absolute inset-0 rounded-full" style={{
                background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.2) 1px, transparent 1px), linear-gradient(rgba(71, 85, 105, 0.2) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
            </div>
          </div>

          {/* Buildings */}
          <div className="flex items-end justify-center gap-6" style={{ transformStyle: 'preserve-3d', height: '400px' }}>
            {data.map((item, index) => {
              const baseHeight = (item.value / max) * 300 + 80;
              const style = getBuildingStyle(index);
              const isHovered = hoveredIndex === index;
              const angle = (index - data.length / 2) * 8;

              return (
                <div
                  key={index}
                  className="relative transition-all duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `translateZ(${index * 10}px) rotateY(${angle}deg)`,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {style.type === 'modern' && (
                    <ModernBuilding
                      height={baseHeight}
                      color={item.color}
                      isHovered={isHovered}
                      label={item.label}
                      value={item.value}
                      secondaryLabel={item.secondaryLabel}
                    />
                  )}
                  {style.type === 'stepped' && (
                    <SteppedBuilding
                      height={baseHeight}
                      color={item.color}
                      isHovered={isHovered}
                      label={item.label}
                      value={item.value}
                      secondaryLabel={item.secondaryLabel}
                    />
                  )}
                  {style.type === 'classic' && (
                    <ClassicBuilding
                      height={baseHeight}
                      color={item.color}
                      isHovered={isHovered}
                      label={item.label}
                      value={item.value}
                      secondaryLabel={item.secondaryLabel}
                    />
                  )}
                  {style.type === 'tower' && (
                    <TowerBuilding
                      height={baseHeight}
                      color={item.color}
                      isHovered={isHovered}
                      label={item.label}
                      value={item.value}
                      secondaryLabel={item.secondaryLabel}
                    />
                  )}
                  {style.type === 'tiered' && (
                    <TieredBuilding
                      height={baseHeight}
                      color={item.color}
                      isHovered={isHovered}
                      label={item.label}
                      value={item.value}
                      secondaryLabel={item.secondaryLabel}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Decorative trees */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`tree-${i}`}
              className="absolute"
              style={{
                width: '20px',
                height: '30px',
                left: `${200 + Math.cos(i * 0.8) * 180}px`,
                bottom: '0px',
                transform: `translateZ(${Math.sin(i * 0.8) * 180}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-full h-2/3 bg-green-700 rounded-full" style={{ transform: 'translateY(10px)' }} />
              <div className="w-1 h-1/3 bg-amber-900 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModernBuilding({ height, color, isHovered, label, value, secondaryLabel }: any) {
  return (
    <div
      className="relative cursor-pointer transition-all duration-300"
      style={{
        width: '85px',
        height: `${height}px`,
        transformStyle: 'preserve-3d',
        transform: isHovered ? 'translateY(-15px) scale(1.05)' : 'translateY(0)',
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${color} rounded-t-lg`} style={{ transform: 'translateZ(42px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
        <div className="absolute inset-0 p-2 grid grid-cols-3 gap-1 overflow-hidden">
          {[...Array(Math.floor(height / 15) * 3)].map((_, i) => (
            <div key={i} className="bg-cyan-200/40 rounded-sm h-3" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
      </div>
      <div className={`absolute top-0 left-full h-full w-[85px] bg-gradient-to-b ${color}`} style={{ transform: 'rotateY(90deg)', transformOrigin: 'left', filter: 'brightness(0.7)' }}>
        <div className="absolute inset-0 p-2 grid grid-cols-2 gap-1 overflow-hidden">
          {[...Array(Math.floor(height / 20) * 2)].map((_, i) => (
            <div key={i} className="bg-cyan-200/30 rounded-sm h-3" />
          ))}
        </div>
      </div>
      <div className={`absolute top-0 left-0 right-0 h-[85px] bg-gradient-to-br ${color} rounded-t-lg`} style={{ transform: 'rotateX(90deg)', transformOrigin: 'top', filter: 'brightness(0.9)' }} />
      <BuildingLabel label={label} value={value} secondaryLabel={secondaryLabel} />
    </div>
  );
}

function SteppedBuilding({ height, color, isHovered, label, value, secondaryLabel }: any) {
  return (
    <div className="relative cursor-pointer transition-all duration-300" style={{ transformStyle: 'preserve-3d', transform: isHovered ? 'translateY(-15px)' : 'translateY(0)' }}>
      {[0.6, 0.8, 1].map((scale, i) => (
        <div
          key={i}
          className={`absolute bg-gradient-to-b ${color}`}
          style={{
            width: `${85 * scale}px`,
            height: `${height * (1 - i * 0.15)}px`,
            bottom: `${height * (i * 0.15)}px`,
            left: `${(85 - 85 * scale) / 2}px`,
            transform: 'translateZ(42px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            borderRadius: i === 2 ? '8px 8px 0 0' : '0',
          }}
        >
          <div className="absolute inset-0 p-1.5 grid grid-cols-3 gap-0.5 overflow-hidden">
            {[...Array(Math.floor((height * (1 - i * 0.15)) / 15) * 3)].map((_, j) => (
              <div key={j} className="bg-amber-200/40 rounded-sm h-2.5" />
            ))}
          </div>
        </div>
      ))}
      <BuildingLabel label={label} value={value} secondaryLabel={secondaryLabel} />
    </div>
  );
}

function ClassicBuilding({ height, color, isHovered, label, value, secondaryLabel }: any) {
  return (
    <div
      className="relative cursor-pointer transition-all duration-300"
      style={{
        width: '75px',
        height: `${height}px`,
        transformStyle: 'preserve-3d',
        transform: isHovered ? 'translateY(-15px) scale(1.05)' : 'translateY(0)',
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${color}`} style={{ transform: 'translateZ(37px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', borderRadius: '4px 4px 0 0' }}>
        <div className="absolute inset-0 p-2 grid grid-cols-4 gap-1 overflow-hidden">
          {[...Array(Math.floor(height / 12) * 4)].map((_, i) => (
            <div key={i} className="bg-yellow-100/50 rounded-sm h-2.5 border border-slate-700/30" />
          ))}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-700 -mt-6 rounded" />
      </div>
      <div className={`absolute top-0 left-full h-full w-[75px] bg-gradient-to-b ${color}`} style={{ transform: 'rotateY(90deg)', transformOrigin: 'left', filter: 'brightness(0.65)' }}>
        <div className="absolute inset-0 p-2 grid grid-cols-3 gap-1 overflow-hidden">
          {[...Array(Math.floor(height / 15) * 3)].map((_, i) => (
            <div key={i} className="bg-yellow-100/40 rounded-sm h-2.5" />
          ))}
        </div>
      </div>
      <div className={`absolute top-0 left-0 right-0 h-[75px] bg-gradient-to-br ${color}`} style={{ transform: 'rotateX(90deg)', transformOrigin: 'top', filter: 'brightness(0.85)', borderRadius: '4px' }} />
      <BuildingLabel label={label} value={value} secondaryLabel={secondaryLabel} />
    </div>
  );
}

function TowerBuilding({ height, color, isHovered, label, value, secondaryLabel }: any) {
  return (
    <div
      className="relative cursor-pointer transition-all duration-300"
      style={{
        width: '70px',
        height: `${height}px`,
        transformStyle: 'preserve-3d',
        transform: isHovered ? 'translateY(-15px) scale(1.05)' : 'translateY(0)',
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${color} rounded-t-2xl`} style={{ transform: 'translateZ(35px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
        <div className="absolute inset-0 p-1.5 flex flex-col gap-0.5 overflow-hidden">
          {[...Array(Math.floor(height / 10))].map((_, i) => (
            <div key={i} className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex-1 bg-blue-200/50 rounded-sm h-2" />
              ))}
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-12 bg-red-600 -mt-12 rounded-t" />
      </div>
      <div className={`absolute top-0 left-full h-full w-[70px] bg-gradient-to-b ${color} rounded-tr-2xl`} style={{ transform: 'rotateY(90deg)', transformOrigin: 'left', filter: 'brightness(0.6)' }} />
      <div className={`absolute top-0 left-0 right-0 h-[70px] bg-gradient-to-br ${color} rounded-t-2xl`} style={{ transform: 'rotateX(90deg)', transformOrigin: 'top', filter: 'brightness(0.9)' }} />
      <BuildingLabel label={label} value={value} secondaryLabel={secondaryLabel} />
    </div>
  );
}

function TieredBuilding({ height, color, isHovered, label, value, secondaryLabel }: any) {
  return (
    <div className="relative cursor-pointer transition-all duration-300" style={{ transformStyle: 'preserve-3d', transform: isHovered ? 'translateY(-15px)' : 'translateY(0)' }}>
      <div className={`absolute bg-gradient-to-b ${color}`} style={{ width: '90px', height: `${height * 0.6}px`, bottom: 0, transform: 'translateZ(45px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
        <div className="absolute inset-0 p-2 grid grid-cols-4 gap-0.5 overflow-hidden">
          {[...Array(Math.floor(height * 0.6 / 12) * 4)].map((_, i) => (
            <div key={i} className="bg-purple-200/40 rounded-sm h-2" />
          ))}
        </div>
      </div>
      <div className={`absolute bg-gradient-to-b ${color} rounded-t-lg`} style={{ width: '70px', height: `${height * 0.45}px`, bottom: `${height * 0.6}px`, left: '10px', transform: 'translateZ(45px)', boxShadow: '0 10px 40px rgba(0,0,0,0.7)' }}>
        <div className="absolute inset-0 p-1.5 grid grid-cols-3 gap-0.5 overflow-hidden">
          {[...Array(Math.floor(height * 0.45 / 12) * 3)].map((_, i) => (
            <div key={i} className="bg-purple-200/50 rounded-sm h-2" />
          ))}
        </div>
      </div>
      <BuildingLabel label={label} value={value} secondaryLabel={secondaryLabel} />
    </div>
  );
}

function BuildingLabel({ label, value, secondaryLabel }: any) {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center" style={{ transform: 'translateZ(50px) translateY(-70px)' }}>
      <div className="bg-slate-800/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-600 shadow-xl whitespace-nowrap">
        <div className="text-white font-bold text-sm">{label}</div>
        {secondaryLabel && <div className="text-slate-300 text-xs mt-0.5 truncate max-w-[100px]">{secondaryLabel}</div>}
        <div className="text-emerald-400 font-semibold text-xs mt-1">${value.toFixed(2)}</div>
      </div>
    </div>
  );
}
