import { createClient } from 'npm:@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface YahooQuote {
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  marketCap: number;
  trailingPE: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

interface YahooHistoricalPrice {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fetchYahooFinanceData(symbol: string) {
  try {
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`;
    const response = await fetch(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    
    if (!result) {
      throw new Error(`No data available for ${symbol}`);
    }

    const quote = result.meta;
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    return {
      quote: {
        regularMarketPrice: quote.regularMarketPrice || 0,
        regularMarketChange: quote.chartPreviousClose ? quote.regularMarketPrice - quote.chartPreviousClose : 0,
        regularMarketChangePercent: quote.chartPreviousClose ? ((quote.regularMarketPrice - quote.chartPreviousClose) / quote.chartPreviousClose) * 100 : 0,
        marketCap: 0,
        trailingPE: 0,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      },
      historical: timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: quotes.open[index] || 0,
        high: quotes.high[index] || 0,
        low: quotes.low[index] || 0,
        close: quotes.close[index] || 0,
        volume: quotes.volume[index] || 0,
      })),
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('symbol');

    if (stocksError) {
      throw stocksError;
    }

    const results = [];

    for (const stock of stocks) {
      try {
        const yahooData = await fetchYahooFinanceData(stock.symbol);

        const { error: quoteError } = await supabase
          .from('stock_quotes')
          .upsert({
            symbol: stock.symbol,
            current_price: yahooData.quote.regularMarketPrice,
            change: yahooData.quote.regularMarketChange,
            change_percent: yahooData.quote.regularMarketChangePercent,
            market_cap: yahooData.quote.marketCap,
            pe_ratio: yahooData.quote.trailingPE,
            week_52_high: yahooData.quote.fiftyTwoWeekHigh,
            week_52_low: yahooData.quote.fiftyTwoWeekLow,
            updated_at: new Date().toISOString(),
          });

        if (quoteError) {
          console.error(`Error updating quote for ${stock.symbol}:`, quoteError);
        }

        for (const price of yahooData.historical) {
          await supabase
            .from('stock_prices')
            .upsert({
              symbol: stock.symbol,
              date: price.date,
              open: price.open,
              high: price.high,
              low: price.low,
              close: price.close,
              volume: price.volume,
            }, {
              onConflict: 'symbol,date',
            });
        }

        results.push({ symbol: stock.symbol, status: 'success' });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ${stock.symbol}:`, error);
        results.push({ symbol: stock.symbol, status: 'error', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stock data updated successfully',
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});