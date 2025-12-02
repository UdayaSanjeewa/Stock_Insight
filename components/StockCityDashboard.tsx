'use client';

import { useState, useEffect } from 'react';
import { Building2, Cloud, User, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState('all');
  const [sentiment, setSentiment] = useState([50]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [cityView, setCityView] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];

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
        <button className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors">
          <User className="w-6 h-6" />
        </button>
      </header>

      <div className="flex flex-col h-[calc(100vh-88px)]">
        <aside className="hidden">
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
            <Label className="text-sm font-medium mb-2 block">Real-Time</Label>
            <div className="text-xs text-emerald-400">● Live Updates Active</div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-center px-12 pb-24">
              <Cloud className="absolute top-20 left-32 w-24 h-24 text-slate-600 opacity-50" />
              <Cloud className="absolute top-32 right-48 w-32 h-32 text-slate-600 opacity-40" />

              <div className="relative flex items-end justify-center gap-8" style={{ perspective: '2000px', perspectiveOrigin: 'center center' }}>
                {stocks.map((stock, index) => {
                  const height = getBuildingHeight(stock.price);
                  const colorClass = getBuildingColor(stock.changePercent);
                  const isSelected = selectedStock?.symbol === stock.symbol;

                  return (
                    <div
                      key={stock.symbol}
                      className="relative cursor-pointer transition-all duration-500 hover:-translate-y-4"
                      style={{
                        height: `${height}px`,
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${(index - 3.5) * 8}deg) translateZ(0px)`
                      }}
                      onClick={() => setSelectedStock(stock)}
                    >
                      <div
                        className={`w-32 h-full relative`}
                        style={{
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        {/* Front Face */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-b ${colorClass} rounded-t-lg overflow-hidden ${
                            isSelected ? 'ring-4 ring-blue-400' : ''
                          }`}
                          style={{
                            transform: 'translateZ(25px)',
                            boxShadow: isSelected
                              ? '0 0 40px rgba(59, 130, 246, 0.8), 0 20px 40px rgba(0, 0, 0, 0.6)'
                              : '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 -2px 8px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <div className="absolute inset-0 grid grid-cols-4 gap-1 p-2">
                            {Array.from({ length: Math.floor(height / 20) }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-yellow-300/20 rounded-sm"
                                style={{ height: '8px' }}
                              />
                            ))}
                          </div>

                          <div className="absolute top-4 left-0 right-0 text-center">
                            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 inline-block rounded">
                              <div className="text-white font-bold text-lg">{stock.symbol}</div>
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center">
                            <div className="text-white text-sm font-medium">
                              ${stock.price.toFixed(2)}
                            </div>
                            <div className={`text-xs ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        {/* Right Side Face */}
                        <div
                          className={`absolute top-0 right-0 h-full bg-gradient-to-b ${colorClass}`}
                          style={{
                            width: '50px',
                            transform: 'rotateY(90deg) translateZ(41px)',
                            transformOrigin: 'left center',
                            filter: 'brightness(0.7)',
                            borderRadius: '0 8px 0 0',
                            boxShadow: 'inset -5px 0 15px rgba(0, 0, 0, 0.4)'
                          }}
                        >
                          {/* Side windows */}
                          <div className="absolute inset-0 grid grid-cols-2 gap-1 p-2">
                            {Array.from({ length: Math.floor(height / 25) }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-yellow-300/15 rounded-sm"
                                style={{ height: '6px' }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Top Face */}
                        <div
                          className={`absolute top-0 left-0 right-0 bg-gradient-to-br ${colorClass}`}
                          style={{
                            height: '50px',
                            transform: 'rotateX(90deg) translateZ(0px)',
                            transformOrigin: 'top center',
                            filter: 'brightness(0.85)',
                            borderRadius: '8px'
                          }}
                        />
                      </div>

                      {/* Ground Shadow */}
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/60 blur-xl rounded-full"
                        style={{
                          width: '80%',
                          height: '20px',
                          transform: 'translateX(-50%) translateZ(-10px)'
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 via-slate-800/50 to-transparent pointer-events-none" />
            </div>
          </div>

          <footer className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 px-12 py-6">
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
          </footer>
        </main>

        {/* Details Panel at Bottom */}
        <aside className="bg-slate-800/90 backdrop-blur-sm border-t border-slate-700">
          {selectedStock ? (
            <div className="px-8 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock Info */}
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <div className="text-3xl font-bold">{selectedStock.symbol}</div>
                    <div className={`text-lg font-medium ${selectedStock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedStock.changePercent >= 0 ? <TrendingUp className="inline w-4 h-4 mr-1" /> : <TrendingDown className="inline w-4 h-4 mr-1" />}
                      {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    ${selectedStock.price.toFixed(2)}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">High</div>
                    <div className="font-semibold text-green-400">${selectedStock.high.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Low</div>
                    <div className="font-semibold text-red-400">${selectedStock.low.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Open</div>
                    <div className="font-semibold">${selectedStock.open.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Prev Close</div>
                    <div className="font-semibold">${selectedStock.previousClose.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Volume</div>
                    <div className="font-semibold">{formatNumber(selectedStock.volume)}</div>
                  </div>
                  {selectedStock.marketCap && (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Market Cap</div>
                      <div className="font-semibold">${formatNumber(selectedStock.marketCap)}</div>
                    </div>
                  )}
                  {selectedStock.sentiment !== undefined && (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Sentiment</div>
                      <div className="font-semibold">{selectedStock.sentiment.toFixed(2)}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Name</div>
                    <div className="font-semibold text-sm truncate">{selectedStock.name}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-8 py-4 text-center text-slate-400">
              Click on a building to view stock details
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
