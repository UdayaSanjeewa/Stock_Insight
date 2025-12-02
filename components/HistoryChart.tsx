'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Activity, Clock } from 'lucide-react';

interface HistoryChartProps {
  stockData: any;
  symbol: string;
  isLoading: boolean;
}

export function HistoryChart({ stockData, symbol, isLoading }: HistoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = useState('1M');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  // Generate historical data based on time range
  useEffect(() => {
    if (stockData && symbol) {
      const generateHistoricalData = () => {
        const basePrice = stockData.price || 100;
        const data = [];
        
        const timeRangeConfig = {
          '1W': { points: 7, interval: 24 * 60 * 60 * 1000, label: '1 Week' },
          '1M': { points: 30, interval: 24 * 60 * 60 * 1000, label: '1 Month' },
          '3M': { points: 90, interval: 24 * 60 * 60 * 1000, label: '3 Months' },
          '6M': { points: 180, interval: 24 * 60 * 60 * 1000, label: '6 Months' },
          '1Y': { points: 365, interval: 24 * 60 * 60 * 1000, label: '1 Year' },
          '2Y': { points: 730, interval: 24 * 60 * 60 * 1000, label: '2 Years' },
          '5Y': { points: 1825, interval: 24 * 60 * 60 * 1000, label: '5 Years' }
        };
        
        const config = timeRangeConfig[timeRange as keyof typeof timeRangeConfig] || timeRangeConfig['1M'];
        const { points, interval } = config;
        
        // Generate realistic price movement with trends
        let currentPrice = basePrice * 0.8; // Start lower to show growth
        let trend = 0.001; // Small upward trend
        
        for (let i = 0; i < points; i++) {
          // Add some market cycles and volatility
          const cycleEffect = Math.sin((i / points) * Math.PI * 4) * 0.1;
          const randomWalk = (Math.random() - 0.5) * 0.02;
          const trendEffect = trend * (i / points);
          
          currentPrice = currentPrice * (1 + cycleEffect + randomWalk + trendEffect);
          
          // Ensure price doesn't go negative
          currentPrice = Math.max(currentPrice, basePrice * 0.1);
          
          const volume = Math.random() * 2000000 + 1000000;
          
          data.push({
            date: new Date(Date.now() - (points - i) * interval),
            price: currentPrice,
            volume: volume,
            change: i > 0 ? ((currentPrice - data[i-1]?.price) / data[i-1]?.price) * 100 : 0
          });
        }
        
        return data;
      };

      const data = generateHistoricalData();
      setHistoricalData(data);
      
      // Calculate statistics
      if (data.length > 0) {
        const prices = data.map(d => d.price);
        const volumes = data.map(d => d.volume);
        const changes = data.map(d => d.change);
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const totalReturn = ((data[data.length - 1].price - data[0].price) / data[0].price) * 100;
        const volatility = Math.sqrt(changes.reduce((sum, change) => sum + Math.pow(change, 2), 0) / changes.length);
        
        setStats({
          minPrice,
          maxPrice,
          avgVolume,
          totalReturn,
          volatility,
          startPrice: data[0].price,
          endPrice: data[data.length - 1].price
        });
      }
    }
  }, [stockData, symbol, timeRange]);

  // Draw chart
  useEffect(() => {
    if (historicalData.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 50;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (historicalData.length === 0) return;

    // Find min/max values
    const prices = historicalData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 6; i++) {
      const y = padding + (i * (height - 2 * padding)) / 6;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (i * priceRange) / 6;
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 4);
    }
    
    // Vertical grid lines
    const timePoints = Math.min(8, historicalData.length);
    for (let i = 0; i <= timePoints; i++) {
      const x = padding + (i * (width - 2 * padding)) / timePoints;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      
      // Date labels
      if (i < historicalData.length) {
        const dataIndex = Math.floor((i * (historicalData.length - 1)) / timePoints);
        const date = historicalData[dataIndex]?.date;
        if (date) {
          ctx.fillStyle = '#64748b';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            x,
            height - padding + 20
          );
        }
      }
    }

    // Draw area chart
    if (chartType === 'area') {
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, stats.totalReturn >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, stats.totalReturn >= 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Start from bottom
      const firstX = padding;
      const firstY = height - padding - ((historicalData[0].price - minPrice) / priceRange) * (height - 2 * padding);
      ctx.moveTo(firstX, height - padding);
      ctx.lineTo(firstX, firstY);
      
      // Draw the price line
      historicalData.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (historicalData.length - 1);
        const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
        ctx.lineTo(x, y);
      });
      
      // Close the area
      const lastX = padding + (width - 2 * padding);
      ctx.lineTo(lastX, height - padding);
      ctx.closePath();
      ctx.fill();
    }

    // Draw price line
    ctx.strokeStyle = stats.totalReturn >= 0 ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    historicalData.forEach((point, index) => {
      const x = padding + (index * (width - 2 * padding)) / (historicalData.length - 1);
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = stats.totalReturn >= 0 ? '#22c55e' : '#ef4444';
    historicalData.forEach((point, index) => {
      if (index % Math.max(1, Math.floor(historicalData.length / 20)) === 0) {
        const x = padding + (index * (width - 2 * padding)) / (historicalData.length - 1);
        const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

  }, [historicalData, chartType, stats]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historical Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <span className="text-muted-foreground">Loading historical data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historical Performance - {symbol.replace('_', ' ')}
            </CardTitle>
            <Badge variant={stats.totalReturn >= 0 ? 'default' : 'destructive'}>
              {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn?.toFixed(2)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="rounded-r-none"
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="rounded-l-none"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="2Y">2Y</SelectItem>
                <SelectItem value="5Y">5Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-80 border rounded-lg"
              style={{ touchAction: 'none' }}
            />
          </div>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Period High</div>
              <div className="font-semibold text-green-600">${stats.maxPrice?.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Period Low</div>
              <div className="font-semibold text-red-600">${stats.minPrice?.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Avg Volume</div>
              <div className="font-semibold">{stats.avgVolume?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Volatility</div>
              <div className="font-semibold">{stats.volatility?.toFixed(2)}%</div>
            </div>
          </div>
          
          {/* Performance Summary */}
          <div className={`p-4 rounded-lg border-l-4 ${
            stats.totalReturn >= 0 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {stats.totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <h4 className={`font-semibold ${
                stats.totalReturn >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                {timeRange} Performance Summary
              </h4>
            </div>
            <p className={`text-sm ${
              stats.totalReturn >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              Over the past {timeRange.toLowerCase()}, {symbol} has {stats.totalReturn >= 0 ? 'gained' : 'lost'} {' '}
              <strong>{Math.abs(stats.totalReturn || 0).toFixed(2)}%</strong>, moving from ${stats.startPrice?.toFixed(2)} to ${stats.endPrice?.toFixed(2)}.
              {stats.volatility > 10 && ' High volatility indicates significant price swings during this period.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}