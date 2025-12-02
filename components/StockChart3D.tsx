'use client';

import { useMemo } from 'react';
import Chart3D from './Chart3D';

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
}

interface StockChart3DProps {
  stock: StockData;
}

export default function StockChart3D({ stock }: StockChart3DProps) {
  const chartData = useMemo(() => {
    const getColor = (value: number, reference: number) => {
      if (value > reference) return 'bg-gradient-to-t from-emerald-600 to-emerald-400';
      if (value < reference) return 'bg-gradient-to-t from-red-600 to-red-400';
      return 'bg-gradient-to-t from-blue-600 to-blue-400';
    };

    return [
      {
        label: 'Prev Close',
        value: stock.previousClose,
        color: 'bg-gradient-to-t from-slate-600 to-slate-400',
        sublabel: `$${stock.previousClose.toFixed(2)}`
      },
      {
        label: 'Open',
        value: stock.open,
        color: getColor(stock.open, stock.previousClose),
        sublabel: `$${stock.open.toFixed(2)}`
      },
      {
        label: 'Low',
        value: stock.low,
        color: 'bg-gradient-to-t from-red-700 to-red-500',
        sublabel: `$${stock.low.toFixed(2)}`
      },
      {
        label: 'Current',
        value: stock.price,
        color: getColor(stock.price, stock.previousClose),
        sublabel: `$${stock.price.toFixed(2)}`
      },
      {
        label: 'High',
        value: stock.high,
        color: 'bg-gradient-to-t from-emerald-700 to-emerald-500',
        sublabel: `$${stock.high.toFixed(2)}`
      },
    ];
  }, [stock]);

  const maxValue = Math.max(...chartData.map(d => d.value)) * 1.1;

  return (
    <Chart3D
      data={chartData}
      title={`${stock.symbol} - Price Analysis`}
      maxValue={maxValue}
      height={350}
    />
  );
}
