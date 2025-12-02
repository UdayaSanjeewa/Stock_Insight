'use client';

import { useState, useEffect, useCallback } from 'react';

interface StockData {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  volatility: number;
  marketCap: number;
  beta: number;
  peRatio: number;
  dividend: number;
  trend: string;
  high52w: number;
  low52w: number;
  type: 'stock' | 'index';
  fullName?: string;
}

export function useStockData(symbol: string) {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const generateStockData = useCallback((symbol: string): StockData => {
    // Base prices for different stocks and indexes
    const basePrices: { [key: string]: number } = {
      // Individual Stocks
      'AAPL': 175.43,
      'GOOGL': 138.21,
      'MSFT': 378.85,
      'AMZN': 144.98,
      'TSLA': 219.16,
      'NVDA': 481.86,
      'META': 296.73,
      'NFLX': 421.25,
      'ORCL': 98.43,
      'CRM': 214.38,
      // Colombo Stock Exchange Indexes
      'ASPI': 10386.27,
      'S&P_SL20': 3128.16,
      'SPL': 45.80,
      'MILANKA': 2847.93,
      'CSE_SELECT': 1256.78
    };

    // Stock/Index information
    const stockInfo: { [key: string]: { type: 'stock' | 'index', fullName: string } } = {
      // Individual Stocks
      'AAPL': { type: 'stock', fullName: 'Apple Inc.' },
      'GOOGL': { type: 'stock', fullName: 'Alphabet Inc.' },
      'MSFT': { type: 'stock', fullName: 'Microsoft Corporation' },
      'AMZN': { type: 'stock', fullName: 'Amazon.com Inc.' },
      'TSLA': { type: 'stock', fullName: 'Tesla Inc.' },
      'NVDA': { type: 'stock', fullName: 'NVIDIA Corporation' },
      'META': { type: 'stock', fullName: 'Meta Platforms Inc.' },
      'NFLX': { type: 'stock', fullName: 'Netflix Inc.' },
      'ORCL': { type: 'stock', fullName: 'Oracle Corporation' },
      'CRM': { type: 'stock', fullName: 'Salesforce Inc.' },
      // Colombo Stock Exchange Indexes
      'ASPI': { type: 'index', fullName: 'All Share Price Index' },
      'S&P_SL20': { type: 'index', fullName: 'S&P Sri Lanka 20 Index' },
      'SPL': { type: 'index', fullName: 'S&P Lanka Index' },
      'MILANKA': { type: 'index', fullName: 'Milanka Price Index' },
      'CSE_SELECT': { type: 'index', fullName: 'CSE Select Index' }
    };

    const basePrice = basePrices[symbol] || 100;
    const info = stockInfo[symbol] || { type: 'stock', fullName: `${symbol} Corporation` };
    
    // Add some random variation to simulate real-time changes
    // Indexes typically have lower volatility than individual stocks
    const variationMultiplier = info.type === 'index' ? 0.01 : 0.02;
    const variation = (Math.random() - 0.5) * variationMultiplier;
    const price = basePrice * (1 + variation);
    
    // Adjust metrics based on type (index vs stock)
    const changePercent = info.type === 'index' 
      ? (Math.random() - 0.5) * 4  // ±2% for indexes
      : (Math.random() - 0.5) * 8; // ±4% for stocks
    
    const volume = info.type === 'index'
      ? Math.floor(Math.random() * 100000000) + 50000000  // 50M-150M for indexes
      : Math.floor(Math.random() * 50000000) + 10000000;  // 10M-60M for stocks
    
    const volatility = info.type === 'index'
      ? Math.random() * 4 + 0.5  // 0.5-4.5% for indexes
      : Math.random() * 8 + 1;   // 1-9% for stocks
    
    const marketCap = info.type === 'index'
      ? price * (Math.random() * 10000000000 + 5000000000)  // Larger for indexes
      : price * (Math.random() * 5000000000 + 1000000000);  // 1B-5B for stocks
    
    const beta = info.type === 'index'
      ? Math.random() * 1.5 + 0.3  // 0.3-1.8 for indexes (more stable)
      : Math.random() * 2 + 0.5;   // 0.5-2.5 for stocks
    
    const peRatio = info.type === 'index'
      ? Math.random() * 25 + 10    // 10-35 for indexes
      : Math.random() * 30 + 5;    // 5-35 for stocks
    
    const dividend = info.type === 'index'
      ? Math.random() * 3 + 1      // 1-4% for indexes
      : Math.random() * 5;         // 0-5% for stocks
    
    let trend = 'neutral';
    if (changePercent > 1) trend = 'bullish';
    else if (changePercent < -1) trend = 'bearish';
    
    const high52w = price * (1 + Math.random() * 0.3 + 0.1); // 10-40% higher
    const low52w = price * (1 - Math.random() * 0.3 - 0.1); // 10-40% lower

    return {
      symbol,
      price,
      changePercent,
      volume,
      volatility,
      marketCap,
      beta,
      peRatio,
      dividend,
      trend,
      high52w,
      low52w,
      type: info.type,
      fullName: info.fullName
    };
  }, []);

  const fetchStockData = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const data = generateStockData(symbol);
    setStockData(data);
    setLastUpdate(new Date());
    setIsLoading(false);
  }, [symbol, generateStockData]);

  // Initial fetch
  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        const data = generateStockData(symbol);
        setStockData(data);
        setLastUpdate(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [symbol, isLoading, generateStockData]);

  return {
    stockData,
    isLoading,
    lastUpdate,
    refetch: fetchStockData
  };
}