'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Volume2, 
  Activity,
  Shield,
  Target,
  Clock
} from 'lucide-react';

interface MarketOverviewProps {
  stockData: any;
  isExpertMode: boolean;
}

export function MarketOverview({ stockData, isExpertMode }: MarketOverviewProps) {
  if (!stockData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    price = 100,
    changePercent = 0,
    volume = 1000000,
    volatility = 5,
    marketCap = 1000000000,
    beta = 1.2,
    peRatio = 15,
    dividend = 2.5
  } = stockData;

  const isPositive = changePercent >= 0;
  const volumeNormalized = Math.min(100, (volume / 10000000) * 100);
  const volatilityLevel = volatility < 3 ? 'Low' : volatility < 7 ? 'Medium' : 'High';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Current Price</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">${price.toFixed(2)}</div>
              <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Volume</span>
              </div>
              <span className="text-sm font-semibold">{volume.toLocaleString()}</span>
            </div>
            <Progress value={volumeNormalized} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {volumeNormalized > 70 ? 'High' : volumeNormalized > 30 ? 'Normal' : 'Low'} trading activity
            </div>
          </div>

          {/* Volatility */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Volatility</span>
              </div>
              <Badge variant={volatilityLevel === 'High' ? 'destructive' : volatilityLevel === 'Medium' ? 'default' : 'secondary'}>
                {volatilityLevel}
              </Badge>
            </div>
            <Progress value={Math.min(100, volatility * 5)} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {volatility.toFixed(1)}% price movement range
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Metrics (Expert Mode) */}
      {isExpertMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Advanced Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="font-semibold">
                  ${(marketCap / 1000000000).toFixed(1)}B
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Beta</div>
                <div className="font-semibold">{beta.toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">P/E Ratio</div>
                <div className="font-semibold">{peRatio.toFixed(1)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Dividend</div>
                <div className="font-semibold">{dividend.toFixed(2)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`p-3 rounded-lg border-l-4 ${
            isPositive ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
          }`}>
            <div className="text-sm font-medium mb-1">
              {isPositive ? 'Positive Momentum' : 'Downward Pressure'}
            </div>
            <div className={`text-xs ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
              {isPositive 
                ? 'Stock is showing upward movement with positive sentiment'
                : 'Stock is experiencing downward pressure, monitor closely'
              }
            </div>
          </div>

          <div className="p-3 rounded-lg border-l-4 bg-blue-50 border-blue-500">
            <div className="text-sm font-medium mb-1">Volume Analysis</div>
            <div className="text-xs text-blue-700">
              {volumeNormalized > 70 
                ? 'High volume indicates strong interest and potential price movement'
                : volumeNormalized > 30
                ? 'Normal volume suggests steady trading activity'
                : 'Low volume may indicate limited interest or consolidation'
              }
            </div>
          </div>

          <div className={`p-3 rounded-lg border-l-4 ${
            volatilityLevel === 'High' 
              ? 'bg-red-50 border-red-500' 
              : volatilityLevel === 'Medium'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-green-50 border-green-500'
          }`}>
            <div className="text-sm font-medium mb-1">Risk Level</div>
            <div className={`text-xs ${
              volatilityLevel === 'High' 
                ? 'text-red-700' 
                : volatilityLevel === 'Medium'
                ? 'text-yellow-700'
                : 'text-green-700'
            }`}>
              {volatilityLevel === 'High' 
                ? 'High volatility - expect significant price swings'
                : volatilityLevel === 'Medium'
                ? 'Moderate volatility - some price movement expected'
                : 'Low volatility - relatively stable price movement'
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Market Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">US Market</div>
              <div className="text-xs text-muted-foreground">
                Next: Opens at 9:30 AM ET
              </div>
            </div>
            <Badge variant="secondary">Closed</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}