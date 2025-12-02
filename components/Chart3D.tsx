'use client';

import { useState } from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
  secondaryLabel?: string;
}

interface Chart3DProps {
  data: ChartDataPoint[];
  title: string;
  maxValue?: number;
  height?: number;
}

export default function Chart3D({ data, title, maxValue, height = 400 }: Chart3DProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState({ x: -20, y: 25 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const max = maxValue || Math.max(...data.map(d => d.value));
  const barWidth = 60;
  const barDepth = 60;
  const spacing = 40;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotation(prev => ({
      x: Math.max(-60, Math.min(0, prev.x - deltaY * 0.3)),
      y: prev.y + deltaX * 0.3
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-xl font-bold mb-6 text-center">{title}</div>

      <div
        className="flex-1 flex items-center justify-center relative"
        style={{ perspective: '2000px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative transition-transform duration-200"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            width: `${(barWidth + spacing) * data.length}px`,
            height: `${height}px`
          }}
        >
          {/* Floor Grid */}
          <div
            className="absolute"
            style={{
              width: `${(barWidth + spacing) * data.length + 200}px`,
              height: `${(barWidth + spacing) * data.length + 200}px`,
              transform: `translateZ(-10px) translateX(-100px) translateY(${height - 50}px)`,
              transformStyle: 'preserve-3d',
              left: 0,
              top: 0
            }}
          >
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(90deg, rgba(71, 85, 105, 0.3) 1px, transparent 1px), linear-gradient(rgba(71, 85, 105, 0.3) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              transform: 'rotateX(90deg)',
              transformOrigin: 'center'
            }} />
          </div>

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / max) * (height - 100);
            const xPosition = index * (barWidth + spacing);
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                className="absolute transition-all duration-300"
                style={{
                  width: `${barWidth}px`,
                  height: `${barHeight}px`,
                  left: `${xPosition}px`,
                  bottom: '50px',
                  transformStyle: 'preserve-3d',
                  transform: isHovered ? 'translateY(-10px) scale(1.05)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Front Face */}
                <div
                  className={`absolute inset-0 ${item.color} rounded-t-lg`}
                  style={{
                    transform: `translateZ(${barDepth / 2}px)`,
                    boxShadow: isHovered
                      ? '0 0 40px rgba(59, 130, 246, 0.6), 0 20px 60px rgba(0, 0, 0, 0.8)'
                      : '0 10px 40px rgba(0, 0, 0, 0.6)',
                    border: isHovered ? '2px solid rgba(59, 130, 246, 0.8)' : 'none'
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-t-lg" />

                  {/* Value label on bar */}
                  {isHovered && (
                    <div className="absolute top-4 left-0 right-0 text-center">
                      <div className="inline-block bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                        <div className="text-white font-bold text-lg">
                          {item.value.toFixed(2)}
                        </div>
                        {item.sublabel && (
                          <div className="text-xs text-slate-300">{item.sublabel}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Face */}
                <div
                  className={`absolute inset-0 ${item.color} rounded-t-lg`}
                  style={{
                    transform: `translateZ(-${barDepth / 2}px) rotateY(180deg)`,
                    filter: 'brightness(0.5)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 rounded-t-lg" />
                </div>

                {/* Right Face */}
                <div
                  className={`absolute top-0 ${item.color}`}
                  style={{
                    width: `${barDepth}px`,
                    height: '100%',
                    left: `${barWidth}px`,
                    transform: 'rotateY(90deg)',
                    transformOrigin: 'left',
                    filter: 'brightness(0.7)',
                    borderRadius: '0 8px 0 0'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30" />
                </div>

                {/* Left Face */}
                <div
                  className={`absolute top-0 ${item.color}`}
                  style={{
                    width: `${barDepth}px`,
                    height: '100%',
                    right: `${barWidth}px`,
                    transform: 'rotateY(-90deg)',
                    transformOrigin: 'right',
                    filter: 'brightness(0.5)',
                    borderRadius: '8px 0 0 0'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40" />
                </div>

                {/* Top Face */}
                <div
                  className={`absolute ${item.color}`}
                  style={{
                    width: `${barWidth}px`,
                    height: `${barDepth}px`,
                    top: 0,
                    left: 0,
                    transform: 'rotateX(90deg)',
                    transformOrigin: 'top',
                    filter: 'brightness(1.2)',
                    borderRadius: '8px'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-lg" />
                </div>

                {/* Label above bar */}
                <div
                  className="absolute text-center"
                  style={{
                    width: `${barWidth * 2}px`,
                    left: `${-barWidth / 2}px`,
                    bottom: `${barHeight + 15}px`,
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(50px)',
                  }}
                >
                  <div className="inline-block space-y-1">
                    <div className="text-white font-bold text-base bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-lg border border-slate-600">
                      {item.label}
                    </div>
                    {item.secondaryLabel && (
                      <div className="text-slate-200 text-xs bg-slate-700/80 backdrop-blur-sm px-2 py-1 rounded shadow-md max-w-[150px] mx-auto line-clamp-1">
                        {item.secondaryLabel}
                      </div>
                    )}
                  </div>
                </div>

                {/* Symbol label on floor */}
                <div
                  className="absolute text-center whitespace-nowrap"
                  style={{
                    width: `${barWidth * 2}px`,
                    left: `${-barWidth / 2}px`,
                    top: `${barHeight + 20}px`,
                    transform: 'rotateX(90deg)',
                    transformOrigin: 'top',
                  }}
                >
                  <div className="text-slate-400 font-semibold text-xs bg-slate-800/60 backdrop-blur-sm px-2 py-0.5 rounded">
                    {item.label}
                  </div>
                </div>

                {/* Shadow */}
                <div
                  className="absolute bg-black/40 blur-xl rounded-full"
                  style={{
                    width: `${barWidth + 20}px`,
                    height: `${barDepth + 20}px`,
                    left: '-10px',
                    top: `${barHeight + 5}px`,
                    transform: 'rotateX(90deg)',
                    transformOrigin: 'center'
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-sm text-slate-400 mt-4">
        Drag to rotate • Hover for details
      </div>
    </div>
  );
}
