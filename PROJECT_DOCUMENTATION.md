# Stock City - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [Database Schema](#database-schema)
5. [Stock Data Flow](#stock-data-flow)
6. [Edge Functions](#edge-functions)
7. [Frontend Components](#frontend-components)
8. [API Integration](#api-integration)
9. [Automated Updates](#automated-updates)
10. [User Journey](#user-journey)

---

## Project Overview

Stock City is a real-time stock market visualization application built with Next.js, Supabase, and 3D graphics. It provides users with:

- **Authentication system** with user profiles
- **Real-time stock data** from Yahoo Finance API
- **3D visualization** of stocks as city buildings
- **Historical price tracking** stored in database
- **Automated daily updates** via scheduled jobs
- **Interactive dashboard** with charts and analytics

### Technology Stack
- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Auth, Edge Functions)
- **3D Graphics**: React Three Fiber
- **Charts**: Recharts
- **API**: Yahoo Finance (via Edge Functions)

---

## Architecture

### System Architecture Diagram

```
┌─────────────┐
│   Browser   │
│   (Client)  │
└──────┬──────┘
       │
       ├─── Auth Requests ────────────┐
       │                              │
       ├─── Data Queries ─────────────┼────┐
       │                              │    │
       ├─── Manual Update Trigger ────┼────┼────┐
       │                              │    │    │
       ▼                              ▼    ▼    ▼
┌───────────────────────────────────────────────────┐
│              Supabase Backend                      │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │    Auth      │  │   Database   │  │  Edge   │ │
│  │   Service    │  │  (Postgres)  │  │Functions│ │
│  └──────────────┘  └──────────────┘  └────┬────┘ │
│                                           │      │
└───────────────────────────────────────────┼──────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │Yahoo Finance │
                                    │     API      │
                                    └──────────────┘

Automated Schedule (pg_cron):
  - Runs daily at 9:30 PM UTC
  - Triggers Edge Function
  - Updates all stock data
```

### Data Flow

```
User Action → Frontend → Supabase Auth/DB → Edge Function → Yahoo Finance
                                    ↓
                           Database Storage (stock_quotes, stock_prices)
                                    ↓
                           Frontend Display (3D City, Charts)
```

---

## Authentication System

### How Authentication Works

#### 1. Sign Up Process

**Step-by-Step Flow:**

```
User fills registration form
  ↓
Frontend collects: email, password, name, address, age, phone
  ↓
AuthContext.signUp() called
  ↓
1. Supabase Auth creates user account (auth.users table)
  ↓
2. User ID returned from auth
  ↓
3. Create user profile record (user_profiles table)
  ↓
4. Profile data linked to auth user via ID
  ↓
Success → User automatically logged in
```

**Code Implementation:**

Location: `/contexts/AuthContext.tsx`

```typescript
const signUp = async (email: string, password: string, profile: UserProfile) => {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // Email confirmation disabled
    },
  });

  if (error) return { error };

  // 2. Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,  // Links to auth.users
        name: profile.name,
        address: profile.address,
        age: profile.age,
        phone_number: profile.phoneNumber,
      });

    if (profileError) return { error: profileError };
  }

  return { error: null };
};
```

**Database Records Created:**

```sql
-- 1. auth.users table (managed by Supabase)
INSERT INTO auth.users (id, email, encrypted_password, ...)

-- 2. user_profiles table (custom)
INSERT INTO user_profiles (id, name, address, age, phone_number)
VALUES (user_id, 'John Doe', '123 Main St', 25, '+1234567890')
```

#### 2. Sign In Process

**Step-by-Step Flow:**

```
User enters email and password
  ↓
AuthContext.signIn() called
  ↓
Supabase Auth validates credentials
  ↓
If valid:
  - Session created
  - JWT token generated
  - User object returned
  ↓
AuthContext updates state
  ↓
app/page.tsx detects user → shows StockCityDashboard
```

**Code Implementation:**

```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};
```

#### 3. Session Management

**How Sessions Persist:**

Location: `/contexts/AuthContext.tsx`

```typescript
useEffect(() => {
  // 1. Check existing session on app load
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  });

  // 2. Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      (() => {
        (async () => {
          setSession(session);
          setUser(session?.user ?? null);
        })();
      })();
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**What Happens:**
1. On page load, checks for existing session in browser storage
2. If session exists and valid → user stays logged in
3. If session expired → user redirected to login
4. Listens for changes (login, logout, token refresh)

#### 4. Sign Out Process

```
User clicks "Sign Out"
  ↓
AuthContext.signOut() called
  ↓
Supabase Auth clears session
  ↓
Local state cleared (user = null)
  ↓
app/page.tsx detects no user → shows LandingPage
```

### Row Level Security (RLS)

**User Profiles Security:**

```sql
-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**How it Works:**
- `auth.uid()` returns the logged-in user's ID
- Queries automatically filtered by user ID
- Impossible to access other users' data

---

## Database Schema

### Tables Overview

```
┌──────────────────┐
│   auth.users     │  (Managed by Supabase)
│   ├── id         │
│   ├── email      │
│   └── ...        │
└────────┬─────────┘
         │ 1:1
         │
┌────────▼─────────┐
│ user_profiles    │
│  ├── id (FK)     │
│  ├── name        │
│  ├── address     │
│  ├── age         │
│  └── phone_number│
└──────────────────┘

┌──────────────────┐
│     stocks       │
│  ├── symbol (PK) │
│  ├── name        │
│  └── exchange    │
└────────┬─────────┘
         │ 1:1
         ├─────────────────────────┐
         │                         │
┌────────▼─────────┐     ┌─────────▼────────┐
│  stock_quotes    │     │  stock_prices    │
│  ├── symbol (FK) │     │  ├── id          │
│  ├── current_price│    │  ├── symbol (FK) │
│  ├── change      │     │  ├── date        │
│  ├── change_%    │     │  ├── open        │
│  ├── market_cap  │     │  ├── high        │
│  └── updated_at  │     │  ├── low         │
└──────────────────┘     │  ├── close       │
                         │  └── volume      │
                         └──────────────────┘
```

### Table Details

#### 1. user_profiles

**Purpose:** Store additional user information beyond email/password

```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  address text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 120),
  phone_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Constraints:**
- Age must be 18-120
- ID must match existing auth user
- Cascade delete when auth user deleted

#### 2. stocks

**Purpose:** Master list of tracked stocks

```sql
CREATE TABLE stocks (
  symbol text PRIMARY KEY,
  name text NOT NULL,
  exchange text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Initial Data:**
```sql
INSERT INTO stocks (symbol, name, exchange) VALUES
  ('AAPL', 'Apple Inc.', 'NASDAQ'),
  ('GOOGL', 'Alphabet Inc.', 'NASDAQ'),
  ('MSFT', 'Microsoft Corporation', 'NASDAQ'),
  ('AMZN', 'Amazon.com Inc.', 'NASDAQ'),
  ('TSLA', 'Tesla Inc.', 'NASDAQ'),
  ('META', 'Meta Platforms Inc.', 'NASDAQ'),
  ('NVDA', 'NVIDIA Corporation', 'NASDAQ'),
  ('NFLX', 'Netflix Inc.', 'NASDAQ');
```

#### 3. stock_quotes

**Purpose:** Store current/latest stock quote data

```sql
CREATE TABLE stock_quotes (
  symbol text PRIMARY KEY REFERENCES stocks(symbol),
  current_price decimal(15,4) NOT NULL,
  change decimal(15,4) DEFAULT 0,
  change_percent decimal(10,4) DEFAULT 0,
  market_cap bigint DEFAULT 0,
  pe_ratio decimal(10,4) DEFAULT 0,
  week_52_high decimal(15,4) DEFAULT 0,
  week_52_low decimal(15,4) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
```

**Updated:** Every time Edge Function runs

#### 4. stock_prices

**Purpose:** Store historical daily price data

```sql
CREATE TABLE stock_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL REFERENCES stocks(symbol),
  date date NOT NULL,
  open decimal(15,4) NOT NULL,
  high decimal(15,4) NOT NULL,
  low decimal(15,4) NOT NULL,
  close decimal(15,4) NOT NULL,
  volume bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(symbol, date)  -- Prevent duplicate entries
);
```

**Indexes for Performance:**
```sql
CREATE INDEX idx_stock_prices_symbol ON stock_prices(symbol);
CREATE INDEX idx_stock_prices_date ON stock_prices(date DESC);
CREATE INDEX idx_stock_prices_symbol_date ON stock_prices(symbol, date DESC);
```

---

## Stock Data Flow

### Complete Data Journey

#### 1. Manual Update (User Clicks "Update All Stocks")

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: User Interaction                                     │
└─────────────────────────────────────────────────────────────┘
User clicks "Update All Stocks" button
  ↓
StockDataManager.handleUpdate() called
  ↓
useStockDataFromDB.triggerUpdate() invoked

┌─────────────────────────────────────────────────────────────┐
│ Step 2: Edge Function Call                                   │
└─────────────────────────────────────────────────────────────┘
Frontend makes HTTP POST request
  ↓
URL: https://{supabase-url}/functions/v1/update-stock-data
  ↓
Headers: Content-Type: application/json
  ↓
Body: {} (empty, no parameters needed)

┌─────────────────────────────────────────────────────────────┐
│ Step 3: Edge Function Execution                              │
└─────────────────────────────────────────────────────────────┘
Edge Function receives request
  ↓
1. Query all stocks from database
   SELECT symbol FROM stocks;
  ↓
2. For each stock (AAPL, GOOGL, etc.):
   ├── Call fetchYahooFinanceData(symbol)
   │   ↓
   │   Make request to Yahoo Finance API
   │   URL: https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1mo
   │   ↓
   │   Parse response data
   │   ↓
   │   Extract:
   │   - Current quote (price, change, etc.)
   │   - Historical data (last 30 days)
   │
   ├── Update stock_quotes table
   │   UPSERT (insert or update if exists)
   │   ↓
   │   INSERT INTO stock_quotes (symbol, current_price, change, ...)
   │   ON CONFLICT (symbol) DO UPDATE ...
   │
   └── Update stock_prices table
       ↓
       For each historical day:
       UPSERT (symbol, date, open, high, low, close, volume)
       ON CONFLICT (symbol, date) DO UPDATE ...
  ↓
3. Wait 1 second between stocks (rate limiting)
  ↓
4. Return results to frontend

┌─────────────────────────────────────────────────────────────┐
│ Step 4: Frontend Updates                                     │
└─────────────────────────────────────────────────────────────┘
Edge Function returns success
  ↓
Frontend waits 5 seconds (data propagation)
  ↓
refreshStocks() called → re-fetch stock list
  ↓
refreshData() called → re-fetch current stock data
  ↓
UI updates with new prices
  ↓
Show success message
```

#### 2. Automated Daily Update

```
┌─────────────────────────────────────────────────────────────┐
│ Scheduled Execution (pg_cron)                                │
└─────────────────────────────────────────────────────────────┘
Every weekday at 9:30 PM UTC (4:30 PM ET)
  ↓
PostgreSQL cron job triggers
  ↓
Cron schedule: '30 21 * * 1-5'
  (minute hour day month weekday)
  ↓
Executes: SELECT trigger_stock_update();

┌─────────────────────────────────────────────────────────────┐
│ Database Function Execution                                  │
└─────────────────────────────────────────────────────────────┘
trigger_stock_update() function runs
  ↓
Uses pg_net extension to make HTTP request
  ↓
Calls Edge Function:
  extensions.http_post(
    url: '{supabase-url}/functions/v1/update-stock-data',
    headers: { 'Content-Type': 'application/json' },
    body: {}
  )
  ↓
[Same Edge Function execution as manual update]
  ↓
Data updated in database automatically
  ↓
Users see fresh data when they next load the app
```

### Data Retrieval (Reading Stock Data)

```
┌─────────────────────────────────────────────────────────────┐
│ User Selects Stock                                           │
└─────────────────────────────────────────────────────────────┘
User clicks stock symbol (e.g., "AAPL")
  ↓
setSelectedSymbol('AAPL')
  ↓
useStockDataFromDB hook triggered with new symbol

┌─────────────────────────────────────────────────────────────┐
│ Data Fetching (Parallel Queries)                            │
└─────────────────────────────────────────────────────────────┘
Three simultaneous queries to Supabase:

Query 1: Stock Info
  SELECT * FROM stocks WHERE symbol = 'AAPL'
  → Returns: { symbol, name, exchange }

Query 2: Current Quote
  SELECT * FROM stock_quotes WHERE symbol = 'AAPL'
  → Returns: { current_price, change, change_percent, ... }

Query 3: Historical Prices
  SELECT * FROM stock_prices
  WHERE symbol = 'AAPL'
  ORDER BY date DESC
  LIMIT 90
  → Returns: Array of daily prices (last 3 months)

┌─────────────────────────────────────────────────────────────┐
│ Data Display                                                 │
└─────────────────────────────────────────────────────────────┘
All data loaded
  ↓
State updated:
  - stock: { symbol, name, exchange }
  - quote: { current_price, change, ... }
  - prices: [{ date, open, high, low, close, volume }, ...]
  ↓
UI re-renders with new data:
  - Stock card shows current price and stats
  - Historical chart displays price trends
  - Volume data shown in charts
```

---

## Edge Functions

### What are Edge Functions?

Edge Functions are serverless functions that run on Supabase's infrastructure. They act as a secure bridge between your frontend and external APIs.

**Why Use Edge Functions?**
- **Security**: API calls hidden from frontend (no exposed keys)
- **CORS**: Bypasses browser CORS restrictions
- **Server-side**: Can make unlimited API calls
- **Database Access**: Direct access to Supabase database

### update-stock-data Function

**Location:** `/supabase/functions/update-stock-data/index.ts`

**Purpose:** Fetch stock data from Yahoo Finance and store in database

**Flow Diagram:**

```
Request → Edge Function → Yahoo Finance API
            ↓
         Parse Data
            ↓
         Database Updates
            ↓
         Response
```

**Code Breakdown:**

```typescript
// 1. Fetch data from Yahoo Finance
async function fetchYahooFinanceData(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const data = await response.json();
  const result = data.chart.result[0];

  // Extract current quote
  const quote = {
    regularMarketPrice: result.meta.regularMarketPrice,
    regularMarketChange: ...,
    fiftyTwoWeekHigh: ...,
    // ... more fields
  };

  // Extract historical prices
  const historical = result.timestamp.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().split('T')[0],
    open: result.indicators.quote[0].open[index],
    high: result.indicators.quote[0].high[index],
    low: result.indicators.quote[0].low[index],
    close: result.indicators.quote[0].close[index],
    volume: result.indicators.quote[0].volume[index],
  }));

  return { quote, historical };
}

// 2. Main function handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all stocks
    const { data: stocks } = await supabase
      .from('stocks')
      .select('symbol');

    const results = [];

    // Process each stock
    for (const stock of stocks) {
      // Fetch from Yahoo Finance
      const yahooData = await fetchYahooFinanceData(stock.symbol);

      // Update current quote
      await supabase.from('stock_quotes').upsert({
        symbol: stock.symbol,
        current_price: yahooData.quote.regularMarketPrice,
        change: yahooData.quote.regularMarketChange,
        // ... more fields
      });

      // Update historical prices
      for (const price of yahooData.historical) {
        await supabase.from('stock_prices').upsert({
          symbol: stock.symbol,
          date: price.date,
          open: price.open,
          high: price.high,
          low: price.low,
          close: price.close,
          volume: price.volume,
        }, {
          onConflict: 'symbol,date'  // Don't duplicate dates
        });
      }

      results.push({ symbol: stock.symbol, status: 'success' });

      // Rate limiting: wait 1 second between stocks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Stock data updated successfully',
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

**Yahoo Finance API Response:**

```json
{
  "chart": {
    "result": [{
      "meta": {
        "symbol": "AAPL",
        "regularMarketPrice": 180.75,
        "chartPreviousClose": 178.50,
        "regularMarketDayHigh": 182.00,
        "regularMarketDayLow": 179.25,
        "regularMarketOpen": 179.50,
        "regularMarketVolume": 52000000,
        "fiftyTwoWeekHigh": 199.62,
        "fiftyTwoWeekLow": 164.08
      },
      "timestamp": [1701388800, 1701475200, ...],
      "indicators": {
        "quote": [{
          "open": [179.50, 180.20, ...],
          "high": [182.00, 181.50, ...],
          "low": [179.25, 179.80, ...],
          "close": [180.75, 180.95, ...],
          "volume": [52000000, 48000000, ...]
        }]
      }
    }]
  }
}
```

---

## Frontend Components

### Component Hierarchy

```
app/page.tsx (Root)
  ├── Loading State
  ├── LandingPage (if not authenticated)
  │   ├── Feature Cards
  │   ├── Login Form
  │   └── Registration Form
  │
  └── StockCityDashboard (if authenticated)
      ├── Header
      │   ├── Logo
      │   ├── Clock
      │   └── Sign Out Button
      │
      ├── Tabs
      │   ├── 3D View Tab
      │   │   ├── Sidebar (Filters)
      │   │   ├── Main Area
      │   │   │   ├── StockCityRealistic (3D City)
      │   │   │   └── BuildingVisualization
      │   │   └── Footer (Market Indices)
      │   │
      │   └── Stock Data Tab
      │       └── StockDataManager
      │           ├── Update Button
      │           ├── Stock Selector
      │           ├── MarketOverviewCharts
      │           ├── Stock Quote Card
      │           └── Historical Data Card
```

### Key Components Explained

#### 1. LandingPage

**Location:** `/components/LandingPage.tsx`

**Purpose:** Login and registration interface

**Key Features:**
- Toggle between login/signup modes
- Form validation (age >= 18)
- Error handling
- Success messages
- Responsive design

**State Management:**
```typescript
const [isLogin, setIsLogin] = useState(true);  // Toggle mode
const [formData, setFormData] = useState({
  name: '',
  email: '',
  address: '',
  age: '',
  phoneNumber: '',
  password: '',
});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

**Form Submission Flow:**
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();

  if (isLogin) {
    // Login flow
    const { error } = await signIn(email, password);
  } else {
    // Registration flow
    if (age < 18) {
      setError('Must be 18+');
      return;
    }

    const { error } = await signUp(email, password, {
      name, address, age, phoneNumber
    });

    if (!error) {
      setIsLogin(true);  // Switch to login mode
      setError('Registration successful!');
    }
  }
};
```

#### 2. StockCityDashboard

**Location:** `/components/StockCityDashboard.tsx`

**Purpose:** Main dashboard with tabs and 3D visualization

**Key Features:**
- Tab navigation (3D View / Stock Data)
- Real-time clock
- Stock data fetching
- Filters (sector, price range, sentiment)
- Market indices footer

**Data Fetching:**
```typescript
useEffect(() => {
  fetchStockData();      // Initial load
  fetchMarketIndices();

  const interval = setInterval(() => {
    fetchStockData();     // Auto-refresh every 60s
    fetchMarketIndices();
  }, 60000);

  return () => clearInterval(interval);
}, []);
```

**Stock Data Structure:**
```typescript
interface StockData {
  symbol: string;           // "AAPL"
  name: string;             // "Apple Inc."
  price: number;            // 180.75
  change: number;           // +2.25
  changePercent: number;    // +1.26
  high: number;             // 182.00
  low: number;              // 179.25
  open: number;             // 179.50
  previousClose: number;    // 178.50
  volume: number;           // 52000000
  marketCap: number;        // 2800000000000
  sentiment: number;        // -1 to 1
}
```

#### 3. StockDataManager

**Location:** `/components/StockDataManager.tsx`

**Purpose:** Display and manage real stock data from database

**Key Features:**
- Manual update trigger
- Stock selection
- Market overview charts
- Current quote display
- Historical price list

**Update Flow:**
```typescript
const handleUpdate = async () => {
  setUpdating(true);
  setUpdateMessage('Fetching from Yahoo Finance...');

  // Trigger Edge Function
  const result = await triggerUpdate();

  if (result.success) {
    setUpdateMessage('Updated successfully!');
    await refreshStocks();    // Reload stock list
    await refreshData();      // Reload current stock
  } else {
    setUpdateMessage(`Error: ${result.error}`);
  }

  setUpdating(false);
};
```

#### 4. MarketOverviewCharts

**Location:** `/components/MarketOverviewCharts.tsx`

**Purpose:** Display market analytics and comparisons

**Charts Displayed:**
1. **Market Performance** (Bar Chart)
   - Shows % change for each stock
   - Green bars = positive, Red bars = negative

2. **Price Comparison** (Line Chart)
   - Last 7 days of prices
   - Multiple stocks on same chart

3. **Market Sentiment** (Pie Chart)
   - Gainers vs Losers vs Unchanged
   - Color-coded segments

**Data Processing:**
```typescript
// Calculate gainers/losers
const gainers = stocks.filter(s => s.change_percent > 0).length;
const losers = stocks.filter(s => s.change_percent < 0).length;
const unchanged = stocks.filter(s => s.change_percent === 0).length;

// Prepare chart data
const sentimentData = [
  { name: 'Gainers', value: gainers, fill: '#10b981' },
  { name: 'Losers', value: losers, fill: '#ef4444' },
  { name: 'Unchanged', value: unchanged, fill: '#64748b' },
];
```

---

## API Integration

### Yahoo Finance API

**Endpoint:** `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`

**Parameters:**
- `interval`: `1d` (1 day)
- `range`: `1mo` (1 month of historical data)

**Why Yahoo Finance?**
- Free (no API key required)
- Real-time data
- Comprehensive information
- Reliable and widely used

**Data Retrieved:**

```javascript
{
  quote: {
    regularMarketPrice: 180.75,      // Current price
    regularMarketChange: 2.25,        // Price change
    regularMarketChangePercent: 1.26, // % change
    chartPreviousClose: 178.50,       // Yesterday's close
    regularMarketDayHigh: 182.00,     // Today's high
    regularMarketDayLow: 179.25,      // Today's low
    regularMarketOpen: 179.50,        // Today's open
    regularMarketVolume: 52000000,    // Trading volume
    fiftyTwoWeekHigh: 199.62,         // 52-week high
    fiftyTwoWeekLow: 164.08,          // 52-week low
    marketCap: 2800000000000,         // Market cap
    trailingPE: 29.5,                 // P/E ratio
  },
  historical: [
    {
      date: "2024-12-01",
      open: 179.50,
      high: 182.00,
      low: 179.25,
      close: 180.75,
      volume: 52000000
    },
    // ... more days
  ]
}
```

### CORS Handling

**Problem:** Browsers block direct API calls to Yahoo Finance due to CORS policy

**Solution:** Edge Functions act as proxy

```
Frontend → Edge Function → Yahoo Finance
  (No CORS) ←  (No CORS)  ← (Returns data)
```

**CORS Headers in Edge Function:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Handle preflight requests
if (req.method === 'OPTIONS') {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// Include in all responses
return new Response(data, { headers: { ...corsHeaders, ... } });
```

---

## Automated Updates

### PostgreSQL Cron Job

**Extension:** pg_cron

**Configuration:** `/supabase/migrations/20251202112715_setup_daily_stock_updates.sql`

**Schedule:**
```sql
SELECT cron.schedule(
  'daily-stock-update',           -- Job name
  '30 21 * * 1-5',                -- Cron expression
  $$SELECT trigger_stock_update();$$
);
```

**Cron Expression Breakdown:**
```
'30 21 * * 1-5'
 │  │  │ │ └── Days of week (1-5 = Mon-Fri)
 │  │  │ └──── Months (all)
 │  │  └────── Days of month (all)
 │  └───────── Hour (21 = 9 PM UTC)
 └──────────── Minute (30)
```

**Schedule:** 9:30 PM UTC every weekday
- Converts to 4:30 PM EST (after market close)
- Skips weekends (markets closed)

### Trigger Function

```sql
CREATE OR REPLACE FUNCTION trigger_stock_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  supabase_url text;
BEGIN
  -- Get Supabase URL from config or use default
  supabase_url := current_setting('app.settings.supabase_url', true);

  IF supabase_url IS NULL THEN
    supabase_url := 'https://<your-project>.supabase.co';
  END IF;

  -- Make HTTP POST request to Edge Function
  SELECT extensions.http_post(
    url := supabase_url || '/functions/v1/update-stock-data',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) INTO request_id;

  RAISE NOTICE 'Stock update triggered with request_id: %', request_id;
END;
$$;
```

**How It Works:**
1. Cron job triggers at scheduled time
2. Calls `trigger_stock_update()` function
3. Function uses `pg_net` to make HTTP request
4. Calls Edge Function URL
5. Edge Function fetches and updates data
6. Database updated automatically

---

## User Journey

### Complete User Flow

#### Journey 1: New User Registration

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Landing Page                                              │
└─────────────────────────────────────────────────────────────┘
User visits site
  ↓
Sees landing page with features
  ↓
Clicks "Sign up"
  ↓
Registration form appears

┌─────────────────────────────────────────────────────────────┐
│ 2. Fill Registration Form                                    │
└─────────────────────────────────────────────────────────────┘
User enters:
  - Name: "John Doe"
  - Email: "john@example.com"
  - Address: "123 Main St"
  - Age: 25
  - Phone: "+1234567890"
  - Password: "securepass123"
  ↓
Clicks "Sign Up"

┌─────────────────────────────────────────────────────────────┐
│ 3. Account Creation                                          │
└─────────────────────────────────────────────────────────────┘
Frontend validation:
  ✓ Age >= 18
  ✓ Password >= 6 characters
  ✓ Valid email format
  ↓
AuthContext.signUp() called
  ↓
Supabase creates auth user
  ↓
Profile record created in database
  ↓
Success message shown
  ↓
Form switches to login mode

┌─────────────────────────────────────────────────────────────┐
│ 4. First Login                                               │
└─────────────────────────────────────────────────────────────┘
User enters email and password
  ↓
Clicks "Sign In"
  ↓
AuthContext.signIn() called
  ↓
Supabase validates credentials
  ↓
Session created
  ↓
User redirected to dashboard
```

#### Journey 2: Viewing Stock Data

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Dashboard Landing                                         │
└─────────────────────────────────────────────────────────────┘
User arrives at StockCityDashboard
  ↓
Default tab: "3D View"
  ↓
3D city visualization loads
  ↓
8 buildings appear (one per stock)
  ↓
Each building height = stock price
  ↓
Building color = performance (green/red)

┌─────────────────────────────────────────────────────────────┐
│ 2. Interact with 3D City                                     │
└─────────────────────────────────────────────────────────────┘
User hovers over building
  ↓
Building lifts up (hover effect)
  ↓
User clicks building
  ↓
Building selected (blue ring appears)
  ↓
Details panel shows:
  - Company name
  - Current price
  - % change
  - Volume
  - Market cap
  - Sentiment

┌─────────────────────────────────────────────────────────────┐
│ 3. Switch to Stock Data Tab                                  │
└─────────────────────────────────────────────────────────────┘
User clicks "Stock Data" tab
  ↓
StockDataManager component loads
  ↓
Shows:
  - Market overview charts
  - Stock selector buttons
  - Default stock: AAPL selected
  ↓
Displays:
  - Current quote card
  - Historical prices (last 10 days)
  - Market sentiment pie chart
  - Price comparison line chart

┌─────────────────────────────────────────────────────────────┐
│ 4. Select Different Stock                                    │
└─────────────────────────────────────────────────────────────┘
User clicks "GOOGL" button
  ↓
setSelectedSymbol('GOOGL')
  ↓
useStockDataFromDB hook triggers
  ↓
Three database queries:
  1. Stock info
  2. Current quote
  3. Historical prices
  ↓
Data loads (loading spinner shown)
  ↓
UI updates with GOOGL data
  ↓
Charts re-render with new data

┌─────────────────────────────────────────────────────────────┐
│ 5. Manual Update                                             │
└─────────────────────────────────────────────────────────────┘
User clicks "Update All Stocks"
  ↓
Button shows "Updating..." with spinner
  ↓
Message: "Fetching from Yahoo Finance..."
  ↓
Edge Function called
  ↓
Waits ~8 seconds (fetching 8 stocks)
  ↓
Success message: "Updated successfully!"
  ↓
All data refreshed
  ↓
Charts and prices update
  ↓
Message disappears after 5 seconds
```

#### Journey 3: Returning User

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Page Load                                                 │
└─────────────────────────────────────────────────────────────┘
User opens website
  ↓
AuthContext checks for existing session
  ↓
Session found in browser storage
  ↓
Session validated with Supabase
  ↓
If valid:
  ✓ User logged in automatically
  ✓ Redirected to dashboard
  ↓
If expired:
  ✗ Redirected to landing page
  ✗ Must login again

┌─────────────────────────────────────────────────────────────┐
│ 2. Dashboard Experience                                      │
└─────────────────────────────────────────────────────────────┘
Dashboard loads immediately
  ↓
Stock data fetched from database
  ↓
Last update time shown
  ↓
User can:
  - View 3D city
  - Check stock data
  - Trigger manual update
  - Browse historical charts
```

---

## Summary

### System Overview

**Stock City** is a comprehensive stock market dashboard that combines:

1. **Authentication System**
   - Secure user registration with profiles
   - Email/password login
   - Session management
   - Row Level Security

2. **Real-time Data**
   - Yahoo Finance API integration
   - Current quotes and historical prices
   - Automatic daily updates
   - Manual refresh capability

3. **Database Storage**
   - Stock information
   - Current quotes
   - Historical price data
   - User profiles

4. **3D Visualization**
   - Interactive city skyline
   - Buildings represent stocks
   - Height = price, Color = performance
   - Hover and click interactions

5. **Analytics Dashboard**
   - Market overview charts
   - Price comparisons
   - Sentiment analysis
   - Historical trends

### Key Technologies

- **Next.js**: Frontend framework
- **Supabase**: Backend (Auth, Database, Functions)
- **PostgreSQL**: Database with pg_cron
- **Yahoo Finance**: Stock data source
- **React Three Fiber**: 3D graphics
- **Recharts**: Data visualization
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### Data Flow Summary

```
User Authentication
  ↓
Dashboard Access
  ↓
View Stock Data
  ├── 3D City Visualization (simulated data)
  └── Real Data Dashboard (from database)
      ↓
      Manual Update Trigger
      ↓
      Edge Function → Yahoo Finance → Database
      ↓
      Automated Daily Updates (pg_cron)
      ↓
      Always Fresh Data
```

---

## Quick Reference

### Important Files

**Authentication:**
- `/contexts/AuthContext.tsx` - Auth logic
- `/components/LandingPage.tsx` - Login/signup UI

**Dashboard:**
- `/app/page.tsx` - Root page
- `/components/StockCityDashboard.tsx` - Main dashboard
- `/components/StockDataManager.tsx` - Data management

**Database:**
- `/supabase/migrations/*.sql` - Schema and setup

**Edge Functions:**
- `/supabase/functions/update-stock-data/index.ts` - Data fetching

**Hooks:**
- `/hooks/useStockDataFromDB.ts` - Data fetching logic

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Common Operations

**Add New Stock:**
```sql
INSERT INTO stocks (symbol, name, exchange)
VALUES ('AAPL', 'Apple Inc.', 'NASDAQ');
```

**Trigger Manual Update:**
```typescript
const result = await triggerUpdate();
```

**Query Stock Data:**
```typescript
const { data } = await supabase
  .from('stock_quotes')
  .select('*')
  .eq('symbol', 'AAPL')
  .maybeSingle();
```

---

## Conclusion

This documentation covers the complete architecture and functionality of the Stock City application. The system provides a secure, real-time stock market dashboard with automated updates, interactive visualizations, and comprehensive data analytics.

For questions or issues, refer to specific sections above or check the inline code comments in each file.
