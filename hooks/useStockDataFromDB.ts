import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StockQuote {
  symbol: string;
  current_price: number;
  change: number;
  change_percent: number;
  market_cap: number;
  pe_ratio: number;
  week_52_high: number;
  week_52_low: number;
  updated_at: string;
}

interface StockPrice {
  id: string;
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
}

export function useStockDataFromDB(symbol: string) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [prices, setPrices] = useState<StockPrice[]>([]);
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    fetchStockData();
  }, [symbol]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stockResult, quoteResult, pricesResult] = await Promise.all([
        supabase
          .from('stocks')
          .select('*')
          .eq('symbol', symbol)
          .maybeSingle(),
        supabase
          .from('stock_quotes')
          .select('*')
          .eq('symbol', symbol)
          .maybeSingle(),
        supabase
          .from('stock_prices')
          .select('*')
          .eq('symbol', symbol)
          .order('date', { ascending: false })
          .limit(90),
      ]);

      if (stockResult.error) throw stockResult.error;
      if (quoteResult.error) throw quoteResult.error;
      if (pricesResult.error) throw pricesResult.error;

      setStock(stockResult.data);
      setQuote(quoteResult.data);
      setPrices(pricesResult.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock data');
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchStockData();
  };

  const triggerUpdate = async () => {
    try {
      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-stock-data`;

      console.log('Calling Edge Function:', functionUrl);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to trigger stock update');
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));

      await refreshData();

      return { success: true, result };
    } catch (err: any) {
      console.error('Error triggering update:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    stock,
    quote,
    prices,
    loading,
    error,
    refreshData,
    triggerUpdate,
  };
}

export function useAllStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllStocks();
  }, []);

  const fetchAllStocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stocks')
        .select('*')
        .order('symbol');

      if (fetchError) throw fetchError;

      setStocks(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stocks');
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    stocks,
    loading,
    error,
    refreshData: fetchAllStocks,
  };
}
