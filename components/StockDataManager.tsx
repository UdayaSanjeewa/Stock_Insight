'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllStocks, useStockDataFromDB } from '@/hooks/useStockDataFromDB';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { MarketOverviewCharts } from './MarketOverviewCharts';

export function StockDataManager() {
  const { stocks, loading: stocksLoading, refreshData: refreshStocks } = useAllStocks();
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const { stock, quote, prices, loading, triggerUpdate, refreshData } = useStockDataFromDB(selectedSymbol);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateMessage('Fetching stock data from Yahoo Finance...');

    const result = await triggerUpdate();

    if (result.success) {
      setUpdateMessage('Stock data updated successfully!');
      await refreshStocks();
      await refreshData();
      setTimeout(() => setUpdateMessage(''), 5000);
    } else {
      setUpdateMessage(`Error: ${result.error}`);
      setTimeout(() => setUpdateMessage(''), 5000);
    }

    setUpdating(false);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return '0.00';
    return num.toFixed(2);
  };

  const formatLargeNumber = (num: number | null | undefined) => {
    if (!num) return '0';
    if (num >= 1000000000000) return `$${(num / 1000000000000).toFixed(2)}T`;
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Stock Data Dashboard</h2>
          <p className="text-slate-400 mt-1">Real-time stock market data from Yahoo Finance</p>
          {updateMessage && (
            <p className={`text-sm mt-2 ${updateMessage.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              {updateMessage}
            </p>
          )}
        </div>
        <Button
          onClick={handleUpdate}
          disabled={updating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
          {updating ? 'Updating...' : 'Update All Stocks'}
        </Button>
      </div>

      <MarketOverviewCharts />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {stocksLoading ? (
          <div className="col-span-full text-center text-slate-400">Loading stocks...</div>
        ) : (
          stocks.map((s) => (
            <Button
              key={s.symbol}
              variant={selectedSymbol === s.symbol ? 'default' : 'outline'}
              onClick={() => setSelectedSymbol(s.symbol)}
              className={selectedSymbol === s.symbol ? 'bg-blue-600' : 'border-slate-600 text-white hover:bg-slate-700'}
            >
              {s.symbol}
            </Button>
          ))
        )}
      </div>

      {loading ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center text-slate-400">
            Loading stock data...
          </CardContent>
        </Card>
      ) : quote ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{stock?.name || selectedSymbol}</span>
                <span className="text-sm text-slate-400">{stock?.exchange}</span>
              </CardTitle>
              <CardDescription className="text-slate-300">Current Quote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-400">Current Price</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  ${formatNumber(quote.current_price)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {quote.change >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-slate-400">Change</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${quote.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {quote.change >= 0 ? '+' : ''}{formatNumber(quote.change)}
                  </div>
                  <div className={`text-sm ${quote.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {quote.change_percent >= 0 ? '+' : ''}{formatNumber(quote.change_percent)}%
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Market Cap</span>
                  <span className="text-white font-semibold">{formatLargeNumber(quote.market_cap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">P/E Ratio</span>
                  <span className="text-white font-semibold">{formatNumber(quote.pe_ratio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">52 Week High</span>
                  <span className="text-white font-semibold">${formatNumber(quote.week_52_high)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">52 Week Low</span>
                  <span className="text-white font-semibold">${formatNumber(quote.week_52_low)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <span className="text-xs text-slate-500">
                  Last updated: {new Date(quote.updated_at).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Historical Data
              </CardTitle>
              <CardDescription className="text-slate-300">
                Last {prices.length} trading days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {prices.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    No historical data available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prices.slice(0, 10).map((price) => {
                      const change = price.close - price.open;
                      const changePercent = (change / price.open) * 100;
                      return (
                        <div
                          key={price.id}
                          className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                        >
                          <div>
                            <div className="text-white font-medium">
                              {new Date(price.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-slate-400">
                              Volume: {(price.volume / 1000000).toFixed(2)}M
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              ${formatNumber(price.close)}
                            </div>
                            <div className={`text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {change >= 0 ? '+' : ''}{formatNumber(changePercent)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center text-slate-400">
            No data available for {selectedSymbol}. Click "Update All Stocks" to fetch data.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
