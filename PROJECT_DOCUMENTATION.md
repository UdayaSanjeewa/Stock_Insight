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
