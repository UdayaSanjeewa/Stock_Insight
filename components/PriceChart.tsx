'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, ZoomIn, RotateCcw, BarChart3, Activity } from 'lucide-react';

interface PriceChartProps {
  stockData: any;
  isLoading: boolean;
  isExpertMode: boolean;
}

export function PriceChart({ stockData, isLoading, isExpertMode }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [chartData, setChartData] = useState<any[]>([]);

  // Generate mock historical data
  useEffect(() => {
    if (stockData) {
      const generateData = () => {
        const basePrice = stockData.price || 100;
        const data = [];
        
        // Define data points and intervals for different timeframes
        const timeframeConfig = {
          '5M': { points: 78, interval: 5 * 60 * 1000 }, // 78 points for 6.5 hours (trading day)
          '15M': { points: 26, interval: 15 * 60 * 1000 }, // 26 points for 6.5 hours
          '30M': { points: 13, interval: 30 * 60 * 1000 }, // 13 points for 6.5 hours
          '1H': { points: 7, interval: 60 * 60 * 1000 }, // 7 points for 7 hours
          '4H': { points: 42, interval: 4 * 60 * 60 * 1000 }, // 42 points for 7 days
          '1D': { points: 30, interval: 24 * 60 * 60 * 1000 }, // 30 days
          '1W': { points: 52, interval: 7 * 24 * 60 * 60 * 1000 }, // 52 weeks
          '1M': { points: 12, interval: 30 * 24 * 60 * 60 * 1000 }, // 12 months
          '3M': { points: 12, interval: 90 * 24 * 60 * 60 * 1000 }, // 12 quarters
          '1Y': { points: 5, interval: 365 * 24 * 60 * 60 * 1000 } // 5 years
        };
        
        const config = timeframeConfig[timeframe as keyof typeof timeframeConfig] || timeframeConfig['1D'];
        const { points, interval } = config;
        
        for (let i = 0; i < points; i++) {
          // Adjust variation based on timeframe (shorter timeframes have less variation)
          const variationMultiplier = timeframe === '5M' || timeframe === '15M' ? 0.02 : 
                                    timeframe === '30M' || timeframe === '1H' ? 0.05 : 0.1;
          const variation = (Math.random() - 0.5) * variationMultiplier;
          const baseVariation = basePrice * (1 + variation * (i / points));
          const volume = Math.random() * 1000000 + 500000;
          
          // Generate OHLC data for candlesticks
          const open = i === 0 ? basePrice : data[i - 1].close;
          const close = baseVariation;
          const high = Math.max(open, close) * (1 + Math.random() * 0.02);
          const low = Math.min(open, close) * (1 - Math.random() * 0.02);
          
          data.push({
            time: Date.now() - (points - i) * interval,
            price: close,
            volume: volume,
            high: high,
            low: low,
            open: open,
            close: close
          });
        }
        
        return data;
      };

      setChartData(generateData());
    }
  }, [stockData, timeframe]);

  // Draw chart on canvas
  useEffect(() => {
    if (chartData.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (chartData.length === 0) return;

    // Find min/max values
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines
    for (let i = 0; i <= 8; i++) {
      const y = padding + (i * (height - 2 * padding)) / 8;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * (width - 2 * padding)) / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    if (chartType === 'line') {
      // Draw price line
      ctx.strokeStyle = stockData?.changePercent >= 0 ? '#00d4aa' : '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.beginPath();

      chartData.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (chartData.length - 1);
        const y = height - padding - ((point.close - minPrice) / priceRange) * (height - 2 * padding);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    } else {
      // Draw candlesticks
      const candleWidth = Math.max(3, Math.min(12, (width - 2 * padding) / chartData.length * 0.8));
      
      chartData.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (chartData.length - 1);
        const openY = height - padding - ((point.open - minPrice) / priceRange) * (height - 2 * padding);
        const closeY = height - padding - ((point.close - minPrice) / priceRange) * (height - 2 * padding);
        const highY = height - padding - ((point.high - minPrice) / priceRange) * (height - 2 * padding);
        const lowY = height - padding - ((point.low - minPrice) / priceRange) * (height - 2 * padding);
        
        const isGreen = point.close >= point.open;
        
        // Draw high-low line (wick)
        ctx.strokeStyle = isGreen ? '#00d4aa' : '#ff6b6b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();
        
        // Draw open-close rectangle (body)
        const bodyHeight = Math.abs(closeY - openY);
        const bodyY = Math.min(openY, closeY);
        
        if (isGreen) {
          ctx.fillStyle = '#00d4aa';
          ctx.strokeStyle = '#00d4aa';
        } else {
          ctx.fillStyle = '#ff6b6b';
          ctx.strokeStyle = '#ff6b6b';
        }
        
        ctx.lineWidth = 1.5;
        
        if (bodyHeight < 1) {
          // Doji - draw a line
          ctx.beginPath();
          ctx.moveTo(x - candleWidth / 2, bodyY);
          ctx.lineTo(x + candleWidth / 2, bodyY);
          ctx.stroke();
        } else {
          // Regular candle
          if (isGreen) {
            // Green candles are filled
            ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
            ctx.strokeRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
          } else {
            // Red candles are filled
            ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
            ctx.strokeRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
          }
        }
      });
    }

    // Draw volume bars if in expert mode
    if (isExpertMode) {
      const volumes = chartData.map(d => d.volume);
      const maxVolume = Math.max(...volumes);
      
      ctx.fillStyle = 'rgba(156, 163, 175, 0.4)';
      
      chartData.forEach((point, index) => {
        const x = padding + (index * (width - 2 * padding)) / (chartData.length - 1);
        const barHeight = (point.volume / maxVolume) * 40;
        const y = height - padding - barHeight;
        
        ctx.fillRect(x - 3, y, 6, barHeight);
      });
    }

    // Draw current price indicator
    const currentPrice = chartData[chartData.length - 1]?.close;
    if (currentPrice) {
      const y = height - padding - ((currentPrice - minPrice) / priceRange) * (height - 2 * padding);
      
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price label
      ctx.fillStyle = '#6366f1';
      ctx.font = '12px sans-serif';
      ctx.fillText(`$${currentPrice.toFixed(2)}`, width - padding + 5, y + 4);
    }

  }, [chartData, isExpertMode, stockData, chartType]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <span className="text-muted-foreground">Loading chart data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const priceChange = stockData?.changePercent || 0;
  const isPositive = priceChange >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : priceChange < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <Minus className="h-5 w-5 text-gray-500" />
              )}
              {stockData?.type === 'index' ? 'Index Chart' : 'Price Chart'}
            </CardTitle>
            <Badge variant={isPositive ? 'default' : 'destructive'}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
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
                variant={chartType === 'candlestick' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('candlestick')}
                className="rounded-l-none"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5M">5M</SelectItem>
                <SelectItem value="15M">15M</SelectItem>
                <SelectItem value="30M">30M</SelectItem>
                <SelectItem value="1H">1H</SelectItem>
                <SelectItem value="4H">4H</SelectItem>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(1)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-64 border rounded"
            style={{ touchAction: 'none' }}
          />
          
          {/* Chart Info */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Price</span>
              <div className="font-semibold">${chartData[chartData.length - 1]?.close?.toFixed(2) || stockData?.price?.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Volume</span>
              <div className="font-semibold">{stockData?.volume?.toLocaleString()}</div>
            </div>
            {chartType === 'candlestick' && chartData.length > 0 && (
              <>
                <div>
                  <span className="text-muted-foreground">Day High</span>
                  <div className="font-semibold text-green-600">
                    ${chartData[chartData.length - 1]?.high?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Day Low</span>
                  <div className="font-semibold text-red-600">
                    ${chartData[chartData.length - 1]?.low?.toFixed(2)}
                  </div>
                </div>
              </>
            )}
            {isExpertMode && (
              <>
                {chartType === 'line' && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Volatility</span>
                      <div className="font-semibold">{stockData?.volatility?.toFixed(2)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Beta</span>
                      <div className="font-semibold">{stockData?.beta?.toFixed(2)}</div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Chart Type Info */}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {chartType === 'line' 
              ? 'Line chart showing price movement over time'
              : 'Candlestick chart showing open, high, low, and close prices'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}