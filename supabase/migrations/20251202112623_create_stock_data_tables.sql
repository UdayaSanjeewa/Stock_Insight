/*
  # Create Stock Data Tables

  1. New Tables
    - `stocks`
      - `symbol` (text, primary key) - Stock ticker symbol (e.g., AAPL, GOOGL)
      - `name` (text) - Company name
      - `exchange` (text) - Stock exchange
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

    - `stock_prices`
      - `id` (uuid, primary key) - Unique identifier
      - `symbol` (text) - References stocks.symbol
      - `date` (date) - Trading date
      - `open` (decimal) - Opening price
      - `high` (decimal) - Highest price
      - `low` (decimal) - Lowest price
      - `close` (decimal) - Closing price
      - `volume` (bigint) - Trading volume
      - `created_at` (timestamptz) - Record creation timestamp

    - `stock_quotes`
      - `symbol` (text, primary key) - Stock ticker symbol
      - `current_price` (decimal) - Current stock price
      - `change` (decimal) - Price change
      - `change_percent` (decimal) - Percentage change
      - `market_cap` (bigint) - Market capitalization
      - `pe_ratio` (decimal) - Price to earnings ratio
      - `week_52_high` (decimal) - 52-week high
      - `week_52_low` (decimal) - 52-week low
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Only service role can insert/update data (for automated updates)

  3. Important Notes
    - Stock data is public and readable by all authenticated users
    - Updates will be performed by Edge Functions using service role
    - Unique constraint on symbol+date for stock_prices to prevent duplicates
*/

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  symbol text PRIMARY KEY,
  name text NOT NULL,
  exchange text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stocks"
  ON stocks
  FOR SELECT
  TO authenticated
  USING (true);

-- Create stock_prices table for historical data
CREATE TABLE IF NOT EXISTS stock_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
  date date NOT NULL,
  open decimal(15,4) NOT NULL,
  high decimal(15,4) NOT NULL,
  low decimal(15,4) NOT NULL,
  close decimal(15,4) NOT NULL,
  volume bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(symbol, date)
);

ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stock prices"
  ON stock_prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_prices_date ON stock_prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_date ON stock_prices(symbol, date DESC);

-- Create stock_quotes table for current data
CREATE TABLE IF NOT EXISTS stock_quotes (
  symbol text PRIMARY KEY REFERENCES stocks(symbol) ON DELETE CASCADE,
  current_price decimal(15,4) NOT NULL,
  change decimal(15,4) DEFAULT 0,
  change_percent decimal(10,4) DEFAULT 0,
  market_cap bigint DEFAULT 0,
  pe_ratio decimal(10,4) DEFAULT 0,
  week_52_high decimal(15,4) DEFAULT 0,
  week_52_low decimal(15,4) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stock_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stock quotes"
  ON stock_quotes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_stocks_updated_at
  BEFORE UPDATE ON stocks
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_updated_at();

CREATE TRIGGER update_stock_quotes_updated_at
  BEFORE UPDATE ON stock_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_updated_at();

-- Insert some popular stocks
INSERT INTO stocks (symbol, name, exchange) VALUES
  ('AAPL', 'Apple Inc.', 'NASDAQ'),
  ('GOOGL', 'Alphabet Inc.', 'NASDAQ'),
  ('MSFT', 'Microsoft Corporation', 'NASDAQ'),
  ('AMZN', 'Amazon.com Inc.', 'NASDAQ'),
  ('TSLA', 'Tesla Inc.', 'NASDAQ'),
  ('META', 'Meta Platforms Inc.', 'NASDAQ'),
  ('NVDA', 'NVIDIA Corporation', 'NASDAQ'),
  ('NFLX', 'Netflix Inc.', 'NASDAQ')
ON CONFLICT (symbol) DO NOTHING;