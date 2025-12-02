# Stock City Dashboard - Data Flow Documentation

## Overview
The Stock City Dashboard is a real-time stock market visualization application that displays stock data as 3D buildings in a city skyline. Each building represents a stock, with its height corresponding to the stock price and color indicating performance (green for gains, red for losses).

## Data Sources

### Current Implementation: Simulated Real-Time Data
The application uses **simulated real-time data** that mimics live stock market behavior. This approach avoids CORS (Cross-Origin Resource Sharing) issues that occur when calling external APIs directly from the browser.

**Why Simulated Data?**
- No CORS restrictions
- No API rate limits
- Reliable and consistent performance
- Perfect for demonstrations and prototypes
- Data updates every 60 seconds with realistic variations

**Base Stock Prices:**
The application uses realistic base prices for major tech stocks and applies random variations to simulate market movements.

### Stock Symbols Tracked
- **AAPL** - Apple Inc.
- **GOOGL** - Alphabet Inc. (Google)
- **MSFT** - Microsoft Corporation
- **AMZN** - Amazon.com Inc.
- **TSLA** - Tesla Inc.
- **META** - Meta Platforms Inc. (Facebook)
- **NVDA** - NVIDIA Corporation
- **NFLX** - Netflix Inc.

### Market Indices Tracked
- **S&P 500** (^GSPC)
- **NASDAQ** (^IXIC)
- **DOW JONES** (^DJI)

---

## Data Flow Architecture

### 1. Initial Data Load
```
User Opens Application
         ↓
Component Mounts (useEffect)
         ↓
fetchStockData() + fetchMarketIndices()
         ↓
Generate Simulated Data with Variations
         ↓
Data Processing & State Update
         ↓
UI Renders with Stock Buildings
```

### 2. Real-Time Updates
```
setInterval (60 seconds)
         ↓
fetchStockData() + fetchMarketIndices()
         ↓
Generate New Simulated Data
         ↓
State Update with New Data
         ↓
UI Re-renders with Updated Prices
```

### 3. Data Processing Pipeline

#### Step 1: Base Data Definition
```typescript
const basePrices: { [key: string]: { price: number; name: string } } = {
  'AAPL': { price: 175.43, name: 'Apple Inc.' },
  'GOOGL': { price: 138.21, name: 'Alphabet Inc.' },
  'MSFT': { price: 378.85, name: 'Microsoft Corporation' },
  // ... other stocks
};
```

#### Step 2: Generate Variations
```typescript
const variation = (Math.random() - 0.5) * 0.02;  // ±1% variation
const price = baseInfo.price * (1 + variation);
const changePercent = (Math.random() - 0.5) * 6;  // ±3% change
```

#### Step 3: Data Transformation
```typescript
return {
  symbol,                                 // Stock ticker (e.g., "AAPL")
  name: baseInfo.name,                    // Company name
  price,                                  // Current price with variation
  change: price - previousClose,          // Price change
  changePercent,                          // Percentage change
  high: price * (1 + Math.random() * 0.02),    // Day's high
  low: price * (1 - Math.random() * 0.02),     // Day's low
  open: previousClose * (1 + (Math.random() - 0.5) * 0.01),  // Opening price
  previousClose,                          // Previous close
  volume: Math.floor(Math.random() * 50000000) + 10000000,  // Trading volume
  marketCap: price * (Math.random() * 5000000000 + 1000000000),  // Market cap
  sentiment: Math.random() * 2 - 1        // Sentiment (-1 to 1)
};
```

---

## Component Structure

### Main Component: StockCityDashboard

#### State Management
- **stocks**: Array of stock data objects
- **marketIndices**: Array of market index data
- **selectedStock**: Currently selected stock for detail view
- **loading**: Loading state during initial fetch
- **sector**: Filter by sector (currently mock data)
- **sentiment**: Sentiment filter slider value
- **priceRange**: Price range filter values
- **cityView**: Toggle for city visualization mode
- **currentTime**: Real-time clock display

#### Key Functions

##### `fetchStockData()`
- Fetches data for all tracked stocks
- Makes parallel API calls using `Promise.all()`
- Updates stocks state
- Sets first stock as selected by default

##### `fetchMarketIndices()`
- Fetches data for S&P 500, NASDAQ, and DOW
- Updates market indices state
- Displays in footer bar

##### `getBuildingHeight(price)`
- Calculates building height based on stock price
- Uses proportional scaling (min: 120px, max: 400px)
- Formula: `minHeight + ((price / maxPrice) * (maxHeight - minHeight))`

##### `getBuildingColor(changePercent)`
- Returns color gradient based on performance
- Green gradient: Positive change
- Red gradient: Negative change
- Gray gradient: No change

---

## Visual Representation Logic

### Building Height Calculation
```typescript
const maxPrice = Math.max(...stocks.map(s => s.price));
const minHeight = 120;
const maxHeight = 400;
height = minHeight + ((price / maxPrice) * (maxHeight - minHeight));
```

**Example:**
- If AAPL = $180 and it's the highest price, building height = 400px
- If GOOGL = $140, building height = 120 + ((140/180) * 280) ≈ 338px

### Building Color Logic
```typescript
if (changePercent > 0)  → Green gradient (stock up)
if (changePercent < 0)  → Red gradient (stock down)
if (changePercent === 0) → Gray gradient (no change)
```

### Window Lights Effect
- Windows are rendered as small yellow rectangles
- Number of windows proportional to building height
- Creates realistic city building appearance

---

## Update Frequency

### Real-Time Clock
- Updates every 1 second (1000ms)
- Displays in header: HH:MM:SS format

### Stock Data Refresh
- Updates every 60 seconds (60000ms)
- Automatically fetches latest prices
- No user interaction required

### User Interactions
- Clicking a building selects it
- Selected stock details appear in right panel
- Filters update display in real-time

---

## API Response Example

### Yahoo Finance API Response Structure
```json
{
  "chart": {
    "result": [{
      "meta": {
        "symbol": "AAPL",
        "longName": "Apple Inc.",
        "regularMarketPrice": 180.75,
        "chartPreviousClose": 178.50,
        "regularMarketDayHigh": 182.00,
        "regularMarketDayLow": 179.25,
        "regularMarketOpen": 179.50,
        "regularMarketVolume": 52000000,
        "marketCap": 2800000000000
      }
    }]
  }
}
```

---

## Data Persistence

### Current Implementation
- **No database storage** - All data is fetched in real-time
- **In-memory state management** using React hooks
- **No historical data storage** - Only current session data

### Future Enhancements (Using Supabase)
If historical data tracking is needed:

1. **Create stocks table:**
```sql
CREATE TABLE stock_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  price DECIMAL(10,2),
  change_percent DECIMAL(5,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **Store data every fetch:**
```typescript
await supabase.from('stock_prices').insert({
  symbol: stock.symbol,
  price: stock.price,
  change_percent: stock.changePercent
});
```

3. **Query historical data:**
```typescript
const { data } = await supabase
  .from('stock_prices')
  .select('*')
  .eq('symbol', 'AAPL')
  .order('recorded_at', { ascending: false })
  .limit(100);
```

---

## Error Handling

### API Failures
```typescript
try {
  // API call
} catch (error) {
  console.error('Error fetching stock data:', error);
  setLoading(false);
}
```

### Fallback Behavior
- If API fails, previous data remains displayed
- Loading state shows "Loading Stock City..." message
- No data loss during temporary outages

---

## Performance Considerations

### Optimization Techniques
1. **Parallel API Calls**: Uses `Promise.all()` to fetch all stocks simultaneously
2. **Memoization**: Selected stock only updates on click
3. **Throttled Updates**: 60-second intervals prevent excessive API calls
4. **Conditional Rendering**: Only selected stock details rendered in sidebar

### Network Efficiency
- **8 stock symbols** = 8 API calls per update
- **3 market indices** = 3 API calls per update
- **Total**: 11 API calls every 60 seconds
- **Daily calls**: ~15,840 calls (well within free tier limits)

---

## Customization Options

### Adding New Stocks
```typescript
const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'NEWSTOCK'];
```

### Changing Update Frequency
```typescript
// Change from 60 seconds to 30 seconds
const interval = setInterval(() => {
  fetchStockData();
  fetchMarketIndices();
}, 30000); // 30 seconds
```

### Adjusting Building Heights
```typescript
const minHeight = 150; // Increase minimum height
const maxHeight = 500; // Increase maximum height
```

---

## API Limitations & Alternatives

### Yahoo Finance API
- **Free**: No API key required
- **Rate Limits**: Generous but not officially documented
- **Reliability**: Generally stable for personal projects
- **CORS**: May require proxy for production

### Alternative APIs

#### 1. Alpha Vantage
- Free tier: 25 requests/day
- Requires API key
- URL: `https://www.alphavantage.co/`

#### 2. Finnhub
- Free tier: 60 calls/minute
- Requires API key
- URL: `https://finnhub.io/`

#### 3. IEX Cloud
- Free tier available
- Requires API key
- URL: `https://iexcloud.io/`

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Browser blocks API requests
**Solution**: Use a proxy or enable CORS in development

#### 2. Loading Indefinitely
**Problem**: API request failed
**Solution**: Check network tab, verify API endpoint

#### 3. Incorrect Data
**Problem**: Outdated prices displayed
**Solution**: Verify internet connection, check API status

---

## UI Layout & Design

The Stock City Dashboard features a clean, immersive full-screen layout:

### Layout Structure
- **Header Bar**: Fixed top bar with "Stock City" title, real-time clock, and user icon
- **Main Visualization Area**: Full-screen 3D city skyline with interactive stock buildings
  - Buildings displayed with 3D perspective and depth effects
  - Each building slightly rotated for realistic cityscape appearance
  - Smooth hover effects that lift buildings upward
  - Selected building highlighted with glowing blue ring
- **Details Panel (Bottom)**: Horizontal panel showing selected stock information
  - Compact horizontal layout maximizes building visibility
  - Three-column grid: Stock info | Key metrics grid | Empty space
  - Only visible when a stock is selected
  - Shows: Symbol, Price, Change %, High, Low, Open, Previous Close, Volume, Market Cap, Sentiment, Name
- **Market Indices Footer**: Shows S&P 500, NASDAQ, and DOW with current values and changes

### 3D Visual Effects
The buildings feature realistic 3D styling:
- **Perspective Transformation**: Each building rotates 2-14 degrees on Y-axis for depth
- **Side Panels**: Visible side faces on buildings for 3D appearance
- **Multi-Layer Shadows**: Deep shadows beneath buildings and inset lighting highlights
- **3D Base Platform**: Dark platform with shadows under each building
- **Smooth Animations**: Hover lifts buildings 10px upward, selection adds glowing ring
- **Color Gradients**: Vertical gradients on building faces simulate lighting
- **Window Lighting**: Yellow-tinted windows arranged in grid pattern

### Responsive Behavior
- Left sidebar automatically hidden for maximum screen space
- Details panel uses responsive grid (1 column on mobile, 3 columns on desktop)
- Buildings scale proportionally to screen size
- Footer adapts to available width

## Summary

The Stock City Dashboard provides a unique visualization of stock market data using a city skyline metaphor. Data flows from simulated sources through React state management to create an interactive, real-time display. Buildings represent stocks with height proportional to price and color indicating performance. The system updates automatically every 60 seconds, providing a continuously fresh view of market conditions.

### Key Features
✅ Simulated real-time stock data (no CORS issues)
✅ 8 major tech stocks visualized as 3D buildings
✅ 3 market indices displayed in footer
✅ Interactive building selection with 3D effects
✅ Horizontal details panel at bottom
✅ Automatic updates every 60 seconds
✅ No API key required
✅ No database needed (optional for historical data)
✅ Full-screen immersive visualization

### Data Flow Summary
```
Simulated Data Generation → State update → React rendering → 3D Visual display
```
