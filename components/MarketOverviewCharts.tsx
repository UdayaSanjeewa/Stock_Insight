'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockQuote {
  symbol: string;
  current_price: number;
  change: number;
  change_percent: number;
  market_cap: number;
}

interface StockPrice {
  symbol: string;
  date: string;
  close: number;
  volume: number;
}

export function MarketOverviewCharts() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [recentPrices, setRecentPrices] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quotesResult, pricesResult] = await Promise.all([
        supabase
          .from('stock_quotes')
          .select('symbol, current_price, change, change_percent, market_cap')
          .order('symbol'),
        supabase
          .from('stock_prices')
          .select('symbol, date, close, volume')
          .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date', { ascending: true }),
      ]);

      if (!quotesResult.error) setQuotes(quotesResult.data || []);
      if (!pricesResult.error) setRecentPrices(pricesResult.data || []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-40 bg-slate-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const gainers = quotes.filter(q => q.change_percent > 0).length;
  const losers = quotes.filter(q => q.change_percent < 0).length;
  const unchanged = quotes.filter(q => q.change_percent === 0).length;

  const marketPerformanceData = {
    labels: quotes.map(q => q.symbol),
    datasets: [
      {
        label: 'Change %',
        data: quotes.map(q => q.change_percent),
        backgroundColor: quotes.map(q =>
          q.change_percent >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: quotes.map(q =>
          q.change_percent >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const marketCapData = {
    labels: quotes.map(q => q.symbol),
    datasets: [
      {
        label: 'Market Cap (B)',
        data: quotes.map(q => q.market_cap / 1000000000),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const marketSentimentData = {
    labels: ['Gainers', 'Losers', 'Unchanged'],
    datasets: [
      {
        data: [gainers, losers, unchanged],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(148, 163, 184, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(148, 163, 184, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pricesBySymbol = recentPrices.reduce((acc, price) => {
    if (!acc[price.symbol]) {
      acc[price.symbol] = [];
    }
    acc[price.symbol].push(price);
    return acc;
  }, {} as Record<string, StockPrice[]>);

  const uniqueDates = new Set(recentPrices.map(p => p.date));
  const dates = Array.from(uniqueDates).sort();

  const priceComparisonData = {
    labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: Object.keys(pricesBySymbol).slice(0, 5).map((symbol, index) => {
      const colors = [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(236, 72, 153, 1)',
      ];
      const prices = pricesBySymbol[symbol];
      const dataByDate = dates.map(date => {
        const price = prices.find(p => p.date === date);
        return price ? price.close : null;
      });

      return {
        label: symbol,
        data: dataByDate,
        borderColor: colors[index],
        backgroundColor: colors[index].replace('1)', '0.1)'),
        tension: 0.4,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 4,
      };
    }),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(241, 245, 249, 0.8)',
          font: {
            size: 11,
          },
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: 'rgba(241, 245, 249, 1)',
        bodyColor: 'rgba(241, 245, 249, 0.8)',
        borderColor: 'rgba(71, 85, 105, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
          font: {
            size: 10,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: 'rgba(241, 245, 249, 0.8)',
          font: {
            size: 11,
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: 'rgba(241, 245, 249, 1)',
        bodyColor: 'rgba(241, 245, 249, 0.8)',
        borderColor: 'rgba(71, 85, 105, 0.5)',
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Market Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <Bar data={marketPerformanceData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Price Comparison (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <Line data={priceComparisonData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Market Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="w-40 h-40">
              <Doughnut data={marketSentimentData} options={doughnutOptions} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
