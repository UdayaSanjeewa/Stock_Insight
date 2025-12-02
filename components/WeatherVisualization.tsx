'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  Wind,
  Thermometer,
  Droplets,
  Eye
} from 'lucide-react';

interface WeatherVisualizationProps {
  stockData: any;
  isLoading: boolean;
  isExpertMode: boolean;
  fullView?: boolean;
}

export function WeatherVisualization({ stockData, isLoading, isExpertMode, fullView = false }: WeatherVisualizationProps) {
  const [weatherCondition, setWeatherCondition] = useState<any>({});

  useEffect(() => {
    if (stockData) {
      const priceChange = stockData.changePercent || 0;
      const volume = stockData.volume || 0;
      const volatility = stockData.volatility || 0;
      const trend = stockData.trend || 'neutral';

      // Determine weather condition based on stock metrics
      let condition = '';
      let icon = Sun;
      let description = '';
      let intensity = 0;
      let color = '';

      if (priceChange >= 3) {
        condition = 'Sunny';
        icon = Sun;
        description = 'Strong bullish momentum';
        intensity = Math.min(100, priceChange * 10);
        color = 'text-yellow-500';
      } else if (priceChange >= 1) {
        condition = 'Partly Cloudy';
        icon = Cloud;
        description = 'Mild upward movement';
        intensity = Math.min(100, priceChange * 15);
        color = 'text-blue-400';
      } else if (priceChange <= -3) {
        condition = 'Stormy';
        icon = CloudSnow;
        description = 'Strong bearish pressure';
        intensity = Math.min(100, Math.abs(priceChange) * 10);
        color = 'text-purple-600';
      } else if (priceChange <= -1) {
        condition = 'Rainy';
        icon = CloudRain;
        description = 'Mild downward pressure';
        intensity = Math.min(100, Math.abs(priceChange) * 15);
        color = 'text-blue-600';
      } else {
        condition = 'Foggy';
        icon = Wind;
        description = 'Sideways movement, unclear direction';
        intensity = 30;
        color = 'text-gray-500';
      }

      // Add volatility indicator
      if (volatility > 5) {
        condition += ' with Lightning';
        description += ' - High volatility detected';
      }

      setWeatherCondition({
        condition,
        icon,
        description,
        intensity,
        color,
        metrics: {
          priceChange,
          volume,
          volatility,
          trend
        }
      });
    }
  }, [stockData]);

  if (isLoading) {
    return (
      <Card className={fullView ? 'h-96' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 animate-bounce" />
            Market Weather
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = weatherCondition.icon || Sun;

  return (
    <Card className={`transition-all duration-500 hover:shadow-lg ${fullView ? 'h-96' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${weatherCondition.color}`} />
            Market Weather
          </span>
          <Badge variant={weatherCondition.intensity > 70 ? 'destructive' : weatherCondition.intensity > 40 ? 'default' : 'secondary'}>
            {weatherCondition.condition}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Weather Display */}
        <div className="text-center space-y-4">
          <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${
            weatherCondition.condition === 'Sunny' ? 'from-yellow-400 to-orange-500' :
            weatherCondition.condition === 'Partly Cloudy' ? 'from-blue-400 to-gray-400' :
            weatherCondition.condition === 'Rainy' ? 'from-blue-600 to-blue-800' :
            weatherCondition.condition === 'Stormy' ? 'from-purple-600 to-gray-800' :
            'from-gray-400 to-gray-600'
          } flex items-center justify-center shadow-lg animate-pulse`}>
            <IconComponent className="h-12 w-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{weatherCondition.condition}</h3>
            <p className="text-muted-foreground">{weatherCondition.description}</p>
            
            {isExpertMode && (
              <div className="text-sm text-muted-foreground">
                Intensity: {weatherCondition.intensity?.toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        {/* Weather Metrics */}
        {fullView && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="h-4 w-4" />
                <span>Price Change</span>
              </div>
              <Progress 
                value={Math.abs(weatherCondition.metrics?.priceChange || 0) * 10} 
                className="h-2"
              />
              <span className={`text-xs ${weatherCondition.metrics?.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {weatherCondition.metrics?.priceChange >= 0 ? '+' : ''}{weatherCondition.metrics?.priceChange?.toFixed(2)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                <span>Volatility</span>
              </div>
              <Progress 
                value={Math.min(100, (weatherCondition.metrics?.volatility || 0) * 5)} 
                className="h-2"
              />
              <span className="text-xs text-muted-foreground">
                {weatherCondition.metrics?.volatility?.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4" />
                <span>Volume</span>
              </div>
              <Progress 
                value={Math.min(100, (weatherCondition.metrics?.volume || 0) / 1000000 * 10)} 
                className="h-2"
              />
              <span className="text-xs text-muted-foreground">
                {(weatherCondition.metrics?.volume || 0).toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4" />
                <span>Clarity</span>
              </div>
              <Progress 
                value={weatherCondition.condition === 'Foggy' ? 20 : 80} 
                className="h-2"
              />
              <span className="text-xs text-muted-foreground">
                {weatherCondition.condition === 'Foggy' ? 'Low' : 'High'}
              </span>
            </div>
          </div>
        )}

        {/* Beginner Mode Insights */}
        {!isExpertMode && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800 mb-2">What this means:</h4>
            <p className="text-blue-700 text-sm">
              {weatherCondition.condition === 'Sunny' && 'Strong positive momentum - consider this a good time for the stock.'}
              {weatherCondition.condition === 'Partly Cloudy' && 'Mild positive movement - stock is doing okay with room to grow.'}
              {weatherCondition.condition === 'Rainy' && 'Some downward pressure - the stock is facing challenges.'}
              {weatherCondition.condition === 'Stormy' && 'Strong negative movement - the stock is experiencing significant pressure.'}
              {weatherCondition.condition === 'Foggy' && 'Uncertain direction - the market is waiting for clearer signals.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}