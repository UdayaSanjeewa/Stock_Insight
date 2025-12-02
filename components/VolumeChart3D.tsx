'use client';

import { useMemo } from 'react';
import Chart3D from './Chart3D';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface VolumeChart3DProps {
  stocks: StockData[];
}

export default function VolumeChart3D({ stocks }: VolumeChart3DProps) {
  const chartData = useMemo(() => {
    const sortedStocks = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 6);

    return sortedStocks.map(stock => {
      const getColor = () => {
        if (stock.changePercent >= 2) return 'bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300';
        if (stock.changePercent >= 0) return 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-emerald-200';
        if (stock.changePercent >= -2) return 'bg-gradient-to-t from-red-600 via-red-400 to-red-200';
        return 'bg-gradient-to-t from-red-700 via-red-500 to-red-300';
      };

      return {
        label: stock.symbol,
        value: stock.volume / 1000000, // Convert to millions
        color: getColor(),
        sublabel: `${(stock.volume / 1000000).toFixed(1)}M`,
        secondaryLabel: stock.name
      };
    });
  }, [stocks]);

  return (
    <Chart3D
      data={chartData}
      title="Trading Volume (Millions)"
      height={350}
    />
  );
}
