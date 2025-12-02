'use client';

import React, { useState, useEffect } from 'react';
import { Bell, User, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { useStockData } from '../hooks/useStockData';
import { PriceChart } from './PriceChart';
import { HistoryChart } from './HistoryChart';
import { BuildingVisualization } from './BuildingVisualization';
import { PredictiveAnalysis } from './PredictiveAnalysis';

export function NewStockDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [filterType, setFilterType] = useState<'stocks' | 'indexes'>('stocks');
  const [volatilityFilter, setVolatilityFilter] = useState(50);
  const [activeTab, setActiveTab] = useState('live');
  const [currentTime, setCurrentTime] = useState(new Date());

  const { stockData: currentStockData, isLoading, lastUpdate } = useStockData(selectedSymbol);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stockFilters = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
  const indexFilters = ['ASPI', 'S&P SL20', 'SPL', 'MILANKA', 'CSE SELECT'];
  
  const currentFilters = filterType === 'stocks' ? stockFilters : indexFilters;

  // Mock data for market summary and gainers/losers
  const marketSummary = {
    cse: { value: 10386.27, change: 0 },
    spl: { value: 45.80, change: 1.19 },
    sp_sl20: { value: 3128.16, change: -0.51 }
  };

  const topGainers = [
    { symbol: 'LIOC', change: 0.98 },
    { symbol: 'CALT', change: 0.71 },
    { symbol: 'RICH', change: 0.63 }
  ];

  const topLosers = [
    { symbol: 'EXPO', change: -1.04 },
    { symbol: 'JKH', change: -0.56 },
    { symbol: 'COMB', change: -0.37 }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (value: number, isIndex = false) => {
    if (isIndex) {
      return (value ?? 0).toFixed(2);
    }
    return `RS ${(value ?? 0).toFixed(2)}`;
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toFixed(0)}`;
  };

  const isIndex = indexFilters.includes(selectedSymbol);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Stockverse
            </h1>
            <p className="text-sm text-slate-400">Stock City</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-lg font-mono">{formatTime(currentTime)}</span>
          <Bell className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
          <User className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Filter Type Toggle */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => {
                  setFilterType('stocks');
                  setSelectedSymbol('AAPL');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'stocks'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Stocks
              </button>
              <button
                onClick={() => {
                  setFilterType('indexes');
                  setSelectedSymbol('ASPI');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'indexes'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Indexes
              </button>
            </div>

            <h3 className="text-lg font-semibold mb-3">Filters</h3>
            <div className="space-y-2">
              {currentFilters.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`w-full p-3 rounded-lg text-left font-medium transition-all ${
                    selectedSymbol === symbol
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Volatility Filter */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Volatility</h3>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              {filterType === 'indexes' ? 'Colombo Stock Exchange updates market indices' : 'Filter stocks by volatility level'}
            </p>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={volatilityFilter}
                onChange={(e) => setVolatilityFilter(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>0%</span>
                <span className="font-medium text-blue-400">{volatilityFilter}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-3">Theme</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-lg"></div>
              </div>
              <span className="text-sm text-slate-300">Dark Mode</span>
            </div>
          </div>

          {/* Market Summary */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4">Market Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Colombo Stock Exchange:</span>
                <span className="font-bold text-white">{marketSummary.cse.value}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">SPL:</span>
                <div className="text-right">
                  <span className="font-bold text-white">{marketSummary.spl.value}</span>
                  <span className="text-green-400 text-sm ml-2">+{marketSummary.spl.change}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">S&P SL20:</span>
                <div className="text-right">
                  <span className="font-bold text-white">{marketSummary.sp_sl20.value}</span>
                  <span className="text-red-400 text-sm ml-2">{marketSummary.sp_sl20.change}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Gainers */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
              Top Gainers
            </h3>
            <div className="space-y-3">
              {topGainers.map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-300">{stock.symbol}</span>
                  <span className="text-green-400 font-bold">+{stock.change}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 text-red-400 mr-2" />
              Top Losers
            </h3>
            <div className="space-y-3">
              {topLosers.map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-300">{stock.symbol}</span>
                  <span className="text-red-400 font-bold">{stock.change}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Metaphor Area */}
        <div className="flex-1 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {isIndex ? 'Index Cityscape' : 'Market Cityscape'}
            </h2>
            {/* <p className="text-slate-400 italic">[Metaphor]</p> */}
          </div>
          
          <div className="h-96 flex items-center justify-center">
            <BuildingVisualization
              stockData={currentStockData}
              isLoading={false}
              isExpertMode={true}
            />
          </div>
        </div>

        {/* Right Sidebar - Stock Details */}
        <div className="w-full lg:w-80">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 sticky top-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedSymbol}</h2>
              <p className="text-slate-300 mb-4">
                {isIndex 
                  ? selectedSymbol === 'ASPI' ? 'All Share Price Index'
                    : selectedSymbol === 'S&P SL20' ? 'S&P Sri Lanka 20 Index'
                    : selectedSymbol === 'SPL' ? 'S&P Lanka Index'
                    : selectedSymbol === 'MILANKA' ? 'Milanka Price Index'
                    : 'CSE Select Index'
                  : selectedSymbol === 'AAPL' ? 'Apple Inc.'
                    : selectedSymbol === 'GOOGL' ? 'Alphabet Inc.'
                    : selectedSymbol === 'MSFT' ? 'Microsoft Corp.'
                    : selectedSymbol === 'TSLA' ? 'Tesla Inc.'
                    : 'Amazon.com Inc.'
                }
              </p>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2 min-h-[3rem] flex items-center justify-center">
                  {isLoading ? (
                    <div className="animate-pulse bg-slate-600 h-8 w-32 rounded"></div>
                  ) : (
                    formatCurrency(currentStockData?.price ?? 0, isIndex)
                  )}
                </div>
                <div className={`text-lg font-semibold ${(currentStockData?.changePercent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {isLoading ? (
                    <div className="animate-pulse bg-slate-600 h-4 w-16 rounded mx-auto"></div>
                  ) : (
                    <>
                      {(currentStockData?.changePercent ?? 0) >= 0 ? '+' : ''}{(currentStockData?.changePercent ?? 0).toFixed(2)}%
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span className="text-slate-400">{isIndex ? 'Index Value:' : 'PE Ratio:'}</span>
                <span className="font-semibold text-white">
                  {isLoading ? (
                    <div className="animate-pulse bg-slate-600 h-4 w-12 rounded"></div>
                  ) : isIndex ? (
                    formatCurrency(currentStockData?.price ?? 0, true)
                  ) : (
                    currentStockData?.peRatio?.toFixed(2) || 'N/A'
                  )}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span className="text-slate-400">{isIndex ? 'Market Cap:' : 'Dividend Yield:'}</span>
                <span className="font-semibold text-white">
                  {isLoading ? (
                    <div className="animate-pulse bg-slate-600 h-4 w-16 rounded"></div>
                  ) : isIndex ? (
                    formatMarketCap(currentStockData?.marketCap ?? 0)
                  ) : (
                    currentStockData?.dividendYield?.toFixed(2) + '%' || 'N/A'
                  )}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span className="text-slate-400">Volatility:</span>
                <span className="font-semibold text-white">
                  {isLoading ? (
                    <div className="animate-pulse bg-slate-600 h-4 w-12 rounded"></div>
                  ) : (
                    (((currentStockData?.volatility ?? 0) * 100).toFixed(2) + '%')
                  )}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Beta:</span>
                <span className="font-semibold text-white">
                  {isLoading ? (
                    <div className="animate-pulse bg-slate-600 h-4 w-12 rounded"></div>
                  ) : (
                    currentStockData?.beta?.toFixed(2) || 'N/A'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom News Ticker */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50 p-4">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
          <div className="overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-slate-300">
                {isIndex 
                  ? `${selectedSymbol} index shows market sentiment with constituent performance analysis`
                  : `${selectedSymbol} stock analysis with real-time market data and predictive insights`
                } • Market volatility at {volatilityFilter}% • 
                {filterType === 'indexes' ? 'Colombo Stock Exchange indices' : 'Global stock markets'} update in real-time
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}