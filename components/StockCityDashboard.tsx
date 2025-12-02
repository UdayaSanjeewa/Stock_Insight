'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Building2, Cloud, User, TrendingUp, TrendingDown, LogOut, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { StockDataManager } from './StockDataManager';

const StockCity3D = dynamic(() => import('./StockCity3D'), { ssr: false });
const StockCityRealistic = dynamic(() => import('./StockCityRealistic'), { ssr: false });
const StockChart3D = dynamic(() => import('./StockChart3D'), { ssr: false });
const VolumeChart3D = dynamic(() => import('./VolumeChart3D'), { ssr: false });

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
  marketCap?: number;
  pe?: number;
  eps?: number;
  sentiment?: number;
}

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export function StockCityDashboard() {
  const { user, signOut } = useAuth();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState('all');
  const [sentiment, setSentiment] = useState([50]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [cityView, setCityView] = useState(true);
  const [chartView, setChartView] = useState<'city' | 'realistic' | 'volume' | 'analysis'>('realistic');
  const [currentTime, setCurrentTime] = useState(new Date());

  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStockData();
    fetchMarketIndices();
    const interval = setInterval(() => {
      fetchStockData();
      fetchMarketIndices();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStockData = async () => {
    try {
      const basePrices: { [key: string]: { price: number; name: string } } = {
        'AAPL': { price: 175.43, name: 'Apple Inc.' },
        'GOOGL': { price: 138.21, name: 'Alphabet Inc.' },
        'MSFT': { price: 378.85, name: 'Microsoft Corporation' },
        'AMZN': { price: 144.98, name: 'Amazon.com Inc.' },
        'TSLA': { price: 219.16, name: 'Tesla Inc.' },
        'META': { price: 296.73, name: 'Meta Platforms Inc.' },
        'NVDA': { price: 481.86, name: 'NVIDIA Corporation' },
        'NFLX': { price: 421.25, name: 'Netflix Inc.' }
      };

      const stockData = stockSymbols.map((symbol) => {
        const baseInfo = basePrices[symbol];
        const variation = (Math.random() - 0.5) * 0.02;
        const price = baseInfo.price * (1 + variation);
        const changePercent = (Math.random() - 0.5) * 6;
        const previousClose = price / (1 + changePercent / 100);

        return {
          symbol,
          name: baseInfo.name,
          price,
          change: price - previousClose,
          changePercent,
          high: price * (1 + Math.random() * 0.02),
          low: price * (1 - Math.random() * 0.02),
          open: previousClose * (1 + (Math.random() - 0.5) * 0.01),
          previousClose,
          volume: Math.floor(Math.random() * 50000000) + 10000000,
          marketCap: price * (Math.random() * 5000000000 + 1000000000),
          sentiment: Math.random() * 2 - 1
        };
      });

      setStocks(stockData);
      if (!selectedStock && stockData.length > 0) {
        setSelectedStock(stockData[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setLoading(false);
    }
  };

  const fetchMarketIndices = async () => {
    try {
      const baseIndices = [
        { name: 'S&P 500', baseValue: 4281.78 },
        { name: 'NASDAQ', baseValue: 13176.78 },
        { name: 'DOW', baseValue: 33674.38 }
      ];

      const indexData = baseIndices.map((index) => {
        const variation = (Math.random() - 0.5) * 0.01;
        const value = index.baseValue * (1 + variation);
        const changePercent = (Math.random() - 0.5) * 2;
        const change = value * (changePercent / 100);

        return {
          name: index.name,
          value,
          change,
          changePercent
        };
      });

      setMarketIndices(indexData);
    } catch (error) {
      console.error('Error fetching market indices:', error);
    }
  };

  const getBuildingHeight = (price: number) => {
    const maxPrice = Math.max(...stocks.map(s => s.price));
    const minHeight = 120;
    const maxHeight = 400;
    return minHeight + ((price / maxPrice) * (maxHeight - minHeight));
  };

  const getBuildingColor = (changePercent: number) => {
    if (changePercent > 0) return 'from-emerald-600 to-emerald-800';
    if (changePercent < 0) return 'from-red-600 to-red-800';
    return 'from-slate-600 to-slate-800';
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Stock City...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-700">
        <h1 className="text-4xl font-bold">Stock City</h1>
        <div className="text-3xl font-mono">
          {currentTime.toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">
            {user?.email}
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <Tabs defaultValue="3d-view" className="flex-1 flex flex-col h-[calc(100vh-88px)]">
        <div className="px-8 pt-4 border-b border-slate-700">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="3d-view">
              <Building2 className="w-4 h-4 mr-2" />
              3D View
            </TabsTrigger>
            <TabsTrigger value="stock-data">
              <Database className="w-4 h-4 mr-2" />
              Stock Data
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="3d-view" className="flex-1 flex m-0">
          <div className="flex flex-1 h-full">
            <aside className="w-72 bg-slate-800/50 backdrop-blur-sm p-6 space-y-6 border-r border-slate-700 overflow-y-auto">
          <div>
            <Label className="text-sm font-medium mb-2 block">Sector</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">
              Sentiment: {sentiment[0].toFixed(0)}
            </Label>
            <Slider
              value={sentiment}
              onValueChange={setSentiment}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </Label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={500}
              step={10}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">High Volatility Only</Label>
            <div className="text-sm text-slate-400">Filter high volatility stocks</div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">City View</Label>
            <Switch checked={cityView} onCheckedChange={setCityView} />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Chart Display</Label>
            <Select value={chartView} onValueChange={(v) => setChartView(v as 'city' | 'realistic' | 'volume' | 'analysis')}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">3D City View</SelectItem>
                <SelectItem value="realistic">Realistic City</SelectItem>
                <SelectItem value="volume">Volume Comparison</SelectItem>
                <SelectItem value="analysis">Stock Analysis Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Real-Time</Label>
            <div className="text-xs text-emerald-400">● Live Updates Active</div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative">
          <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="absolute inset-0">
              {chartView === 'city' ? (
                <StockCity3D
                  stocks={stocks}
                  selectedStock={selectedStock}
                  onSelectStock={(stock) => setSelectedStock(stock)}
                />
              ) : chartView === 'realistic' ? (
                <StockCityRealistic
                  data={stocks.map(stock => ({
                    label: stock.symbol,
                    value: stock.price,
                    color: stock.changePercent >= 0 ? 'from-emerald-500 to-emerald-700' : 'from-red-500 to-red-700',
                    sublabel: `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`,
                    secondaryLabel: stock.name
                  }))}
                  title="Stock Market City"
                  maxValue={Math.max(...stocks.map(s => s.price))}
                />
              ) : chartView === 'volume' ? (
                <VolumeChart3D stocks={stocks} />
              ) : (
                <div className="w-full h-full overflow-auto p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stocks.slice(0, 6).map((stock) => (
                      <div key={stock.symbol} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700">
                          <div className="flex items-baseline gap-2 mb-1">
                            <div className="text-2xl font-bold">{stock.symbol}</div>
                            <div className={`text-sm font-medium ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {stock.changePercent >= 0 ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                          <div className="text-xl font-bold">${stock.price.toFixed(2)}</div>
                          <div className="text-xs text-slate-400 mt-1">{stock.name}</div>
                        </div>
                        <div className="h-[350px] bg-slate-900/30 p-3">
                          <StockChart3D stock={stock} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          <footer className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700">
            {selectedStock && (chartView === 'city' || chartView === 'realistic') ? (
              <div className="px-8 py-4">
                <div className="flex items-start gap-8">
                  {/* Stock Details Section */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <div className="text-3xl font-bold">{selectedStock.symbol}</div>
                      <div className={`text-lg font-medium ${selectedStock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedStock.changePercent >= 0 ? <TrendingUp className="inline w-4 h-4 mr-1" /> : <TrendingDown className="inline w-4 h-4 mr-1" />}
                        {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-3">
                      ${selectedStock.price.toFixed(2)}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">High</div>
                        <div className="font-semibold text-green-400">${selectedStock.high.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Low</div>
                        <div className="font-semibold text-red-400">${selectedStock.low.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Volume</div>
                        <div className="font-semibold text-xs">{formatNumber(selectedStock.volume)}</div>
                      </div>
                      {selectedStock.marketCap && (
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Market Cap</div>
                          <div className="font-semibold text-xs">${formatNumber(selectedStock.marketCap)}</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-slate-400">{selectedStock.name}</div>
                  </div>

                  {/* Market Indices Section */}
                  <div className="flex gap-8">
                    {marketIndices.map((index) => (
                      <div key={index.name} className="text-center">
                        <div className="text-xs font-medium text-slate-400 mb-1">{index.name}</div>
                        <div className="text-lg font-bold mb-1">
                          {index.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-medium ${index.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-12 py-6">
                <div className="flex items-center justify-between gap-12">
                  {marketIndices.map((index) => (
                    <div key={index.name} className="flex-1 text-center">
                      <div className="text-sm font-medium text-slate-400 mb-1">{index.name}</div>
                      <div className="text-2xl font-bold mb-1">
                        {index.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm font-medium ${index.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </footer>
        </main>
          </div>
        </TabsContent>

        <TabsContent value="stock-data" className="m-0 p-8 h-full overflow-auto">
          <StockDataManager />
        </TabsContent>
      </Tabs>

    </div>
  );
}
