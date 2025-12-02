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
      const stockPromises = stockSymbols.map(async (symbol) => {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);
        const data = await response.json();

        const quote = data.chart.result[0];
        const meta = quote.meta;

        return {
          symbol: meta.symbol,
          name: meta.longName || meta.symbol,
          price: meta.regularMarketPrice,
          change: meta.regularMarketPrice - meta.chartPreviousClose,
          changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
          high: meta.regularMarketDayHigh,
          low: meta.regularMarketDayLow,
          open: meta.regularMarketOpen || meta.chartPreviousClose,
          previousClose: meta.chartPreviousClose,
          volume: meta.regularMarketVolume,
          marketCap: meta.marketCap,
          sentiment: Math.random() * 2 - 1
        };
      });

      const stockData = await Promise.all(stockPromises);
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
      const indices = [
        { symbol: '^GSPC', name: 'S&P 500' },
        { symbol: '^IXIC', name: 'NASDAQ' },
        { symbol: '^DJI', name: 'DOW' }
      ];

      const indexPromises = indices.map(async (index) => {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}?interval=1d&range=1d`);
        const data = await response.json();
        const meta = data.chart.result[0].meta;

        return {
          name: index.name,
          value: meta.regularMarketPrice,
          change: meta.regularMarketPrice - meta.chartPreviousClose,
          changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
        };
      });

      const indexData = await Promise.all(indexPromises);
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

      <div className="flex h-[calc(100vh-88px)]">
        <aside className="w-72 bg-slate-800/50 backdrop-blur-sm p-6 space-y-6 border-r border-slate-700">
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

        <main className="flex-1 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-center px-12 pb-24">
              <Cloud className="absolute top-20 left-32 w-24 h-24 text-slate-600 opacity-50" />
              <Cloud className="absolute top-32 right-48 w-32 h-32 text-slate-600 opacity-40" />

              <div className="relative flex items-end justify-center gap-8 perspective-1000">
                {stocks.map((stock, index) => {
                  const height = getBuildingHeight(stock.price);
                  const colorClass = getBuildingColor(stock.changePercent);
                  const isSelected = selectedStock?.symbol === stock.symbol;

                  return (
                    <div
                      key={stock.symbol}
                      className="relative cursor-pointer transform transition-all duration-300 hover:scale-105"
                      style={{ height: `${height}px` }}
                      onClick={() => setSelectedStock(stock)}
                    >
                      <div
                        className={`w-32 h-full bg-gradient-to-b ${colorClass} rounded-t-lg relative overflow-hidden shadow-2xl ${
                          isSelected ? 'ring-4 ring-blue-500' : ''
                        }`}
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

                      <div className="absolute -bottom-2 left-0 right-0 h-2 bg-slate-900/80 rounded-b-sm" />
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

        <aside className="w-96 bg-slate-800/50 backdrop-blur-sm p-6 border-l border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Details</h2>

          {selectedStock && (
            <div className="space-y-6">
              <div>
                <div className="text-4xl font-bold mb-2">{selectedStock.symbol}</div>
                <div className="text-3xl font-bold mb-1">
                  ${selectedStock.price.toFixed(2)}
                </div>
                <div className={`text-lg font-medium ${selectedStock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedStock.changePercent >= 0 ? <TrendingUp className="inline w-5 h-5 mr-1" /> : <TrendingDown className="inline w-5 h-5 mr-1" />}
                  {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">High</span>
                  <span className="font-medium">${selectedStock.high.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Low</span>
                  <span className="font-medium">${selectedStock.low.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Open</span>
                  <span className="font-medium">${selectedStock.open.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Prev Close</span>
                  <span className="font-medium">${selectedStock.previousClose.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Volume</span>
                  <span className="font-medium">{formatNumber(selectedStock.volume)}</span>
                </div>
                {selectedStock.marketCap && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Market Cap</span>
                    <span className="font-medium">${formatNumber(selectedStock.marketCap)}</span>
                  </div>
                )}
                {selectedStock.sentiment !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Sentiment</span>
                    <span className="font-medium">{selectedStock.sentiment.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <div className="h-24 flex items-end gap-1">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-slate-600 rounded-t-sm"
                      style={{ height: `${Math.random() * 100}%` }}
                    />
                  ))}
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                Compare
              </button>

              <Card className="bg-slate-700/50 border-slate-600 p-6">
                <h3 className="text-lg font-bold mb-4">Market Sentiment</h3>
                <div className="relative h-32 flex items-center justify-center">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-600"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.65)}`}
                      className="text-emerald-500 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-2xl font-bold">65%</div>
                </div>
                <div className="text-center mt-2 text-sm text-slate-400">Market Sentiment</div>
              </Card>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
