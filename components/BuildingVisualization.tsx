'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building, TrendingUp, TrendingDown, Home, Zap } from 'lucide-react';

interface BuildingVisualizationProps {
  stockData: any;
  isLoading: boolean;
  isExpertMode: boolean;
  fullView?: boolean;
}

export function BuildingVisualization({ stockData, isLoading, isExpertMode, fullView = false }: BuildingVisualizationProps) {
  const [cityscape, setCityscape] = useState<any>({});

  useEffect(() => {
    if (stockData) {
      const priceChange = stockData.changePercent || 0;
      const volume = stockData.volume || 0;
      const volatility = stockData.volatility || 0;
      const price = stockData.price || 100;

      // Generate buildings based on stock performance
      const buildings = [];
      const numBuildings = 8;
      
      for (let i = 0; i < numBuildings; i++) {
        const isMainBuilding = i === Math.floor(numBuildings / 2);
        let height, color, type, intensity;
        
        if (isMainBuilding) {
          // Main building represents current stock performance
          height = Math.max(20, Math.min(100, 50 + priceChange * 5));
          color = priceChange >= 0 ? 'green' : 'red';
          type = priceChange >= 3 ? 'skyscraper' : priceChange <= -3 ? 'declining' : 'normal';
          intensity = Math.abs(priceChange);
        } else {
          // Supporting buildings represent market context
          const variation = (Math.random() - 0.5) * 20;
          height = Math.max(15, Math.min(80, 40 + variation + (priceChange * 2)));
          color = (priceChange + variation) >= 0 ? 'green' : 'red';
          type = 'normal';
          intensity = Math.abs(priceChange + variation);
        }
        
        buildings.push({
          id: i,
          height,
          color,
          type,
          intensity,
          isMain: isMainBuilding,
          windows: Math.floor(height / 10) * 3 // More windows for taller buildings
        });
      }

      // Determine overall city mood
      const greenBuildings = buildings.filter(b => b.color === 'green').length;
      const redBuildings = buildings.filter(b => b.color === 'red').length;
      
      let cityMood = '';
      let description = '';
      
      if (greenBuildings > redBuildings + 2) {
        cityMood = 'Booming';
        description = 'The market district is thriving with strong bullish sentiment';
      } else if (redBuildings > greenBuildings + 2) {
        cityMood = 'Declining';
        description = 'The financial district shows bearish pressure';
      } else {
        cityMood = 'Mixed';
        description = 'The market shows mixed signals with balanced sentiment';
      }

      setCityscape({
        buildings,
        cityMood,
        description,
        dominantColor: greenBuildings > redBuildings ? 'green' : redBuildings > greenBuildings ? 'red' : 'mixed',
        metrics: {
          priceChange,
          volume,
          volatility,
          price
        }
      });
    }
  }, [stockData]);

  if (isLoading) {
    return (
      <Card className={fullView ? 'h-96' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 animate-bounce" />
            Market Cityscape
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBuildingColor = (building: any) => {
    if (building.color === 'green') {
      return building.isMain 
        ? 'from-green-400 to-green-600' 
        : 'from-green-300 to-green-500';
    } else {
      return building.isMain 
        ? 'from-red-400 to-red-600' 
        : 'from-red-300 to-red-500';
    }
  };

  const getBuildingIcon = (building: any) => {
    if (building.type === 'skyscraper') return TrendingUp;
    if (building.type === 'declining') return TrendingDown;
    return Building;
  };

  return (
    <div className={`transition-all duration-500 ${fullView ? 'h-96' : ''}`}>
      <CardHeader>
        {!fullView && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {stockData?.type === 'index' ? 'Index Cityscape' : 'Market Cityscape'}
            </span>
            <Badge variant={
              cityscape.dominantColor === 'green' ? 'default' : 
              cityscape.dominantColor === 'red' ? 'destructive' : 'secondary'
            }>
              {cityscape.cityMood}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cityscape Visualization */}
        <div className="relative">
          <div className={`flex items-end justify-center gap-1 ${fullView ? 'h-80' : 'h-40'} bg-gradient-to-t from-slate-900 to-slate-700 rounded-lg p-4 overflow-hidden`}>
            {/* Sky background with clouds */}
            <div className="absolute top-2 left-4 w-8 h-4 bg-gray-400 rounded-full opacity-30"></div>
            <div className="absolute top-4 right-8 w-6 h-3 bg-gray-400 rounded-full opacity-25"></div>
            <div className="absolute top-6 left-1/3 w-10 h-5 bg-gray-400 rounded-full opacity-20"></div>
            
            {/* Buildings */}
            {cityscape.buildings?.map((building: any) => {
              const IconComponent = getBuildingIcon(building);
              return (
                <div
                  key={building.id}
                  className={`relative bg-gradient-to-t ${getBuildingColor(building)} rounded-t-sm shadow-lg transition-all duration-1000 hover:scale-105 ${
                    building.isMain ? `ring-2 ${stockData?.type === 'index' ? 'ring-blue-400' : 'ring-yellow-400'} ring-opacity-50` : ''
                  }`}
                  style={{ 
                    height: `${building.height}%`, 
                    width: fullView ? '80px' : '40px',
                    minHeight: '20px'
                  }}
                >
                  {/* Building windows */}
                  <div className="absolute inset-1 grid grid-cols-3 gap-0.5">
                    {Array.from({ length: building.windows }).map((_, i) => (
                      <div
                        key={i}
                        className={`${fullView ? 'w-2 h-2' : 'w-1 h-1'} ${
                          Math.random() > 0.3 ? 'bg-yellow-300' : 'bg-gray-700'
                        } opacity-80`}
                      />
                    ))}
                  </div>
                  
                  {/* Building icon on top */}
                  {building.isMain && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <IconComponent className={`h-4 w-4 ${stockData?.type === 'index' ? 'text-blue-400' : 'text-yellow-500'}`} />
                    </div>
                  )}
                  
                  {/* Intensity indicator */}
                  {building.intensity > 5 && (
                    <div className="absolute -top-1 -right-1">
                      <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Ground line */}
          <div className="h-2 bg-gray-600 rounded-b-lg"></div>
        </div>

        {/* City Description */}
        <div className="text-center space-y-2 text-white">
          <h3 className="text-xl font-bold text-white">
            {cityscape.cityMood} {stockData?.type === 'index' ? 'Market' : 'District'}
          </h3>
          <p className="text-gray-300 text-sm">
            {stockData?.type === 'index' 
              ? cityscape.description.replace('market district', 'index performance').replace('financial district', 'market index')
              : cityscape.description
            }
          </p>
        </div>

        {/* Building Metrics */}
        {fullView && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Bullish Buildings</span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                {cityscape.buildings?.filter((b: any) => b.color === 'green').length || 0}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span>Bearish Buildings</span>
              </div>
              <div className="text-lg font-semibold text-red-600">
                {cityscape.buildings?.filter((b: any) => b.color === 'red').length || 0}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4" />
                <span>Market Height</span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, 50 + (cityscape.metrics?.priceChange || 0) * 5))} 
                className="h-2"
              />
              <span className="text-xs text-muted-foreground">
                {cityscape.metrics?.priceChange >= 0 ? 'Rising' : 'Falling'} skyline
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                <span>Activity Level</span>
              </div>
              <Progress 
                value={Math.min(100, (cityscape.metrics?.volume || 0) / 1000000 * 10)} 
                className="h-2"
              />
              <span className="text-xs text-muted-foreground">
                {(cityscape.metrics?.volume || 0) > 20000000 ? 'Busy' : 'Quiet'} district
              </span>
            </div>
          </div>
        )}

        {/* Beginner Mode Insights */}
        {!isExpertMode && !fullView && (
          <div className={`p-4 rounded-lg border-l-4 ${
            cityscape.dominantColor === 'green' 
              ? 'bg-green-50 border-green-500' 
              : cityscape.dominantColor === 'red'
              ? 'bg-red-50 border-red-500'
              : 'bg-blue-50 border-blue-500'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              cityscape.dominantColor === 'green' 
                ? 'text-green-800' 
                : cityscape.dominantColor === 'red'
                ? 'text-red-800'
                : 'text-blue-800'
            }`}>
              What this cityscape means:
            </h4>
            <p className={`text-sm ${
              cityscape.dominantColor === 'green' 
                ? 'text-green-700' 
                : cityscape.dominantColor === 'red'
                ? 'text-red-700'
                : 'text-blue-700'
            }`}>
              {cityscape.cityMood === 'Booming' && 'The market is like a thriving city with tall green buildings representing strong growth and positive investor sentiment.'}
              {cityscape.cityMood === 'Declining' && 'The market resembles a struggling district with red buildings showing bearish pressure and declining values.'}
              {cityscape.cityMood === 'Mixed' && 'The market is like a diverse city with both growing and declining areas, showing mixed investor sentiment.'}
              {' The highlighted building in the center represents your selected stock.'}
            </p>
          </div>
        )}
      </CardContent>
    </div>
  );
}