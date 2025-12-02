'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { WeatherVisualization } from '@/components/WeatherVisualization';
import { PriceChart } from '@/components/PriceChart';
import { PredictiveAnalysis } from '@/components/PredictiveAnalysis';
import { MarketOverview } from '@/components/MarketOverview';
import { StockSearch } from '@/components/StockSearch';
import { BuildingVisualization } from '@/components/BuildingVisualization';
import { HistoryChart } from '@/components/HistoryChart';
import { useStockData } from '@/hooks/useStockData';
import { Search, TrendingUp, BarChart3, Cloud, User, Settings, Building, Calendar } from 'lucide-react';

export function StockDashboard() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [isExpertMode, setIsExpertMode] = useState(false);
  const { stockData, isLoading, lastUpdate } = useStockData(selectedStock);

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Stock Insight
          </h1>
          <p className="text-muted-foreground">
            Real-time financial data with intuitive metaphorical visualizations
          </p>
        </div>
        
        {/* <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isExpertMode ? 'Expert' : 'Beginner'} Mode
            </span>
            <Switch
              checked={isExpertMode}
              onCheckedChange={setIsExpertMode}
            />
          </div>
          <Badge variant={isLoading ? 'secondary' : 'default'} className="animate-pulse">
            {isLoading ? 'Updating...' : 'Live'}
          </Badge>
        </div> */}
        
        <div className="flex items-center space-x-4">
          <Badge variant={isLoading ? 'secondary' : 'default'} className="animate-pulse">
            {isLoading ? 'Updating...' : 'Live'}
          </Badge>
        </div>
      </div>

      {/* Stock Search */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <StockSearch onStockSelect={handleStockSelect} selectedStock={selectedStock} />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Weather & Overview */}
        <div className="space-y-6">
          <WeatherVisualization 
            stockData={stockData} 
            isLoading={isLoading}
            isExpertMode={isExpertMode}
          />
          <MarketOverview 
            stockData={stockData}
            isExpertMode={isExpertMode}
          />
        </div>

        {/* Right Columns - Charts & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="price" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="price" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Price Chart
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="weather" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Weather View
              </TabsTrigger>
              <TabsTrigger value="buildings" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Cityscape
              </TabsTrigger>
              <TabsTrigger value="forecast" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Forecast
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="price" className="mt-6">
              <PriceChart 
                stockData={stockData}
                isLoading={isLoading}
                isExpertMode={isExpertMode}
              />
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <HistoryChart 
                stockData={stockData}
                symbol={selectedStock}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="weather" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weather-Based Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeatherVisualization 
                    stockData={stockData} 
                    isLoading={isLoading}
                    isExpertMode={isExpertMode}
                    fullView={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="buildings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Cityscape Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <BuildingVisualization 
                    stockData={stockData} 
                    isLoading={isLoading}
                    isExpertMode={isExpertMode}
                    fullView={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="forecast" className="mt-6">
              <PredictiveAnalysis 
                stockData={stockData}
                isExpertMode={isExpertMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer Info */}
      {lastUpdate && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}