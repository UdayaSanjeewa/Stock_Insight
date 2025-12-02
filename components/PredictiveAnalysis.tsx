'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Brain, Target, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface PredictiveAnalysisProps {
  stockData: any;
  isExpertMode: boolean;
}

export function PredictiveAnalysis({ stockData, isExpertMode }: PredictiveAnalysisProps) {
  const [predictions, setPredictions] = useState<any>({});
  const [confidence, setConfidence] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');

  useEffect(() => {
    if (stockData && selectedTimeframe) {
      setIsAnalyzing(true);
      
      // Simulate ML prediction calculation
      setTimeout(() => {
        const currentPrice = stockData.price || 100;
        const volatility = stockData.volatility || 5;
        const trend = stockData.changePercent || 0;
        
        // Generate mock predictions based on timeframe
        const timeframeMultipliers = {
          '5M': { short: 0.005, medium: 0.015, long: 0.03, confidence: 85 },
          '15M': { short: 0.01, medium: 0.03, long: 0.06, confidence: 80 },
          '30M': { short: 0.015, medium: 0.045, long: 0.09, confidence: 75 },
          '1H': { short: 0.02, medium: 0.06, long: 0.12, confidence: 70 },
          '4H': { short: 0.05, medium: 0.15, long: 0.25, confidence: 65 },
          '1D': { short: 0.05, medium: 0.15, long: 0.25, confidence: 60 },
          '1W': { short: 0.1, medium: 0.25, long: 0.4, confidence: 55 },
          '1M': { short: 0.15, medium: 0.35, long: 0.6, confidence: 50 }
        };
        
        const multiplier = timeframeMultipliers[selectedTimeframe as keyof typeof timeframeMultipliers] || timeframeMultipliers['1H'];
        
        // Adjust prediction periods based on timeframe
        const getPredictionPeriods = (timeframe: string) => {
          switch (timeframe) {
            case '5M':
              return { next: 'Next 5 Minutes', short: 'Next 30 Minutes', long: 'Next 2 Hours' };
            case '15M':
              return { next: 'Next 15 Minutes', short: 'Next Hour', long: 'Next 4 Hours' };
            case '30M':
              return { next: 'Next 30 Minutes', short: 'Next 2 Hours', long: 'Next Day' };
            case '1H':
              return { next: 'Next Hour', short: 'Next 4 Hours', long: 'Next Day' };
            case '4H':
              return { next: 'Next 4 Hours', short: 'Next Day', long: 'Next Week' };
            case '1D':
              return { next: 'Next Day', short: 'Next Week', long: 'Next Month' };
            case '1W':
              return { next: 'Next Week', short: 'Next Month', long: 'Next Quarter' };
            case '1M':
              return { next: 'Next Month', short: 'Next Quarter', long: 'Next Year' };
            default:
              return { next: 'Next Period', short: 'Short Term', long: 'Long Term' };
          }
        };
        
        const periods = getPredictionPeriods(selectedTimeframe);
        
        const predictions = {
          nextPeriod: {
            label: periods.next,
            price: currentPrice * (1 + (Math.random() - 0.5) * multiplier.short),
            direction: Math.random() > 0.5 ? 'up' : 'down',
            confidence: multiplier.confidence + Math.random() * 10
          },
          shortTerm: {
            label: periods.short,
            price: currentPrice * (1 + (Math.random() - 0.5) * multiplier.medium),
            direction: trend > 0 ? 'up' : 'down',
            confidence: multiplier.confidence - 10 + Math.random() * 15
          },
          longTerm: {
            label: periods.long,
            price: currentPrice * (1 + (Math.random() - 0.5) * multiplier.long),
            direction: Math.random() > 0.4 ? 'up' : 'down',
            confidence: multiplier.confidence - 20 + Math.random() * 15
          }
        };
        
        // Risk assessment
        const timeframeRiskMultiplier = selectedTimeframe === '5M' || selectedTimeframe === '15M' ? 0.5 : 
                                      selectedTimeframe === '1M' || selectedTimeframe === '1W' ? 1.5 : 1;
        const riskScore = Math.min(100, (volatility * 5 + Math.abs(trend) * 2) * timeframeRiskMultiplier);
        
        // Technical indicators
        const indicators = {
          rsi: 30 + Math.random() * 40,
          macd: Math.random() - 0.5,
          support: currentPrice * 0.95,
          resistance: currentPrice * 1.05,
          riskScore
        };
        
        setPredictions({ ...predictions, indicators });
        setConfidence(predictions.nextPeriod.confidence);
        setIsAnalyzing(false);
      }, 2000);
    }
  }, [stockData, selectedTimeframe]);

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < 70) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const riskInfo = getRiskLevel(predictions.indicators?.riskScore || 0);

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            ML-Powered Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground">Analyzing market patterns...</p>
              <Progress value={65} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              ML-Powered Predictions
            </span>
            <div className="flex items-center gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-20">
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
                </SelectContent>
              </Select>
              <Badge variant="secondary">
                {confidence.toFixed(0)}% Confidence
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="predictions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="predictions">Forecasts</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
            </TabsList>
            
            <TabsContent value="predictions" className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(predictions).filter(([key]) => key !== 'indicators').map(([timeframe, data]: [string, any]) => (
                  <Card key={timeframe}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold capitalize">
                            {data.label || timeframe.replace(/([A-Z])/g, ' $1')}
                          </h4>
                          <p className="text-2xl font-bold">
                            ${data.price?.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2">
                            {data.direction === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${data.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {data.direction === 'up' ? 'Bullish' : 'Bearish'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm text-muted-foreground">Confidence</div>
                          <div className="font-semibold">{data.confidence?.toFixed(0)}%</div>
                          <Progress value={data.confidence} className="w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <h5 className="font-semibold text-blue-800">Timeframe Analysis:</h5>
                </div>
                <p className="text-blue-700 text-sm">
                  {selectedTimeframe === '5M' || selectedTimeframe === '15M' 
                    ? 'Short-term predictions with higher accuracy but limited scope. Best for scalping and quick trades.'
                    : selectedTimeframe === '1H' || selectedTimeframe === '4H'
                    ? 'Medium-term predictions balancing accuracy and scope. Suitable for day trading and swing trading.'
                    : 'Long-term predictions with broader market context. Ideal for position trading and investment decisions.'
                  }
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="risk" className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Risk Assessment</h4>
                      <Badge className={`${riskInfo.bg} ${riskInfo.color} border-0`}>
                        {riskInfo.level} Risk
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Score</span>
                          <span>{predictions.indicators?.riskScore?.toFixed(0)}/100</span>
                        </div>
                        <Progress value={predictions.indicators?.riskScore || 0} className="h-3" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Support Level</div>
                          <div className="font-semibold text-green-600">
                            ${predictions.indicators?.support?.toFixed(2)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Resistance Level</div>
                          <div className="font-semibold text-red-600">
                            ${predictions.indicators?.resistance?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!isExpertMode && (
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mt-4">
                        <h5 className="font-semibold text-blue-800 mb-1">Risk Explanation:</h5>
                        <p className="text-blue-700 text-sm">
                          {riskInfo.level === 'Low' && 'This stock shows stable patterns with minimal volatility. Suitable for conservative investors.'}
                          {riskInfo.level === 'Medium' && 'Moderate risk level with some volatility. Consider your risk tolerance before investing.'}
                          {riskInfo.level === 'High' && 'High volatility detected. This stock may experience significant price swings.'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="indicators" className="space-y-4">
              {isExpertMode && (
                <div className="grid gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">RSI (14)</span>
                          <span className="font-semibold">
                            {predictions.indicators?.rsi?.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={predictions.indicators?.rsi || 0} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {(predictions.indicators?.rsi || 0) < 30 ? 'Oversold' : 
                           (predictions.indicators?.rsi || 0) > 70 ? 'Overbought' : 'Neutral'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">MACD</span>
                          <span className={`font-semibold ${
                            (predictions.indicators?.macd || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {predictions.indicators?.macd >= 0 ? '+' : ''}{predictions.indicators?.macd?.toFixed(3)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(predictions.indicators?.macd || 0) >= 0 ? 'Bullish Signal' : 'Bearish Signal'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {!isExpertMode && (
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Technical Indicators</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Advanced technical analysis is available in Expert Mode
                    </p>
                    <Button variant="outline" size="sm">
                      Switch to Expert Mode
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}