'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeatherVisualization } from '@/components/WeatherVisualization';
import { PriceChart } from '@/components/PriceChart';
import { PredictiveAnalysis } from '@/components/PredictiveAnalysis';
import { MarketOverview } from '@/components/MarketOverview';
import { BuildingVisualization } from '@/components/BuildingVisualization';
import { HistoryChart } from '@/components/HistoryChart';
import { useStockData } from '@/hooks/useStockData';
import { 
  ArrowLeft, 
  TrendingUp, 
  BarChart3, 
  Cloud, 
  Building, 
  Calendar,
  Share2,
  Star,
  Bell
} from 'lucide-react';
import Link from 'next/link';

export default function StockPage() {
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase() || 'AAPL';
  const { stockData, isLoading, lastUpdate } = useStockData(symbol);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Stock company names mapping
  const stockNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'ORCL': 'Oracle Corporation',
    'CRM': 'Salesforce Inc.',
  };

  const companyName = stockNames[symbol] || `${symbol} Corporation`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">{symbol}</h1>
                {stockData && (
                  <Badge variant={stockData.changePercent >= 0 ? 'default' : 'destructive'}>
                    {stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent?.toFixed(2)}%
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg">{companyName}</p>
              {stockData && (
                <p className="text-3xl font-bold">
                  ${stockData.price?.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isWatchlisted ? "default" : "outline"}
              size="sm"
              onClick={() => setIsWatchlisted(!isWatchlisted)}
            >
              <Star className={`h-4 w-4 mr-2 ${isWatchlisted ? 'fill-current' : ''}`} />
              {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Badge variant={isLoading ? 'secondary' : 'default'} className="animate-pulse">
              {isLoading ? 'Updating...' : 'Live'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        {stockData && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">52W High</div>
                <div className="font-semibold text-green-600">${stockData.high52w?.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">52W Low</div>
                <div className="font-semibold text-red-600">${stockData.low52w?.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Volume</div>
                <div className="font-semibold">{stockData.volume?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="font-semibold">${(stockData.marketCap / 1000000000).toFixed(1)}B</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">P/E Ratio</div>
                <div className="font-semibold">{stockData.peRatio?.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Beta</div>
                <div className="font-semibold">{stockData.beta?.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Visualizations */}
          <div className="space-y-6">
            <WeatherVisualization 
              stockData={stockData} 
              isLoading={isLoading}
              isExpertMode={true}
            />
            <BuildingVisualization 
              stockData={stockData} 
              isLoading={isLoading}
              isExpertMode={true}
            />
            <MarketOverview 
              stockData={stockData}
              isExpertMode={true}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="price" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="price" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Live Chart
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="forecast" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Forecast
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="price" className="mt-6">
                <PriceChart 
                  stockData={stockData}
                  isLoading={isLoading}
                  isExpertMode={true}
                />
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <HistoryChart 
                  stockData={stockData}
                  symbol={symbol}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="forecast" className="mt-6">
                <PredictiveAnalysis 
                  stockData={stockData}
                  isExpertMode={true}
                />
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weather-Based Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WeatherVisualization 
                        stockData={stockData} 
                        isLoading={isLoading}
                        isExpertMode={true}
                        fullView={true}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Cityscape</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BuildingVisualization 
                        stockData={stockData} 
                        isLoading={isLoading}
                        isExpertMode={true}
                        fullView={true}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Info */}
        {lastUpdate && (
          <div className="text-center text-sm text-muted-foreground">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()} • 
            Data provided for educational purposes
          </div>
        )}
      </div>
    </div>
  );
}