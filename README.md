# TORQ ⚡

### Every Rig. Every Deal. One Signal.

> **TORQ** is a multi-source vehicle deal aggregator that pulls listings from across the web — cars, trucks, trailers, motorcycles, vans, and parts — normalizes them into a single database, scores them for deal quality, and surfaces the best opportunities through one unified dashboard.

-----

## What Is TORQ?

Most vehicle platforms show you their own listings. TORQ shows you **everything** — then tells you what’s actually worth buying.

We aggregate data from Facebook Marketplace, CarGurus, AutoTrader, Cars.com, Craigslist, eBay Motors, CarMax, and more, then apply deal-scoring logic to flag listings priced significantly below market value for that exact make, model, year, and mileage bracket.

Built for:

- **Private buyers** hunting underpriced vehicles
- **Dealers** monitoring competitive inventory
- **Fleet buyers** tracking commercial vehicle pricing
- **Mechanics and flippers** spotting parts and project vehicles

-----

## Platform Domain

**torq.io**

-----

## Vehicle Categories Covered

- Cars & Sedans
- Trucks (Light & Heavy Duty)
- Semi Trucks & Commercial Vehicles
- Trailers (Flatbed, Enclosed, Utility)
- Motorcycles & Dirt Bikes
- Vans & Sprinters
- Auto Parts & Accessories
- RVs & Campers

-----

## Core Architecture

```
┌─────────────────────────────────────────────────────┐
│                   DATA SOURCES                      │
│  FB Marketplace · CarGurus · AutoTrader · Cars.com  │
│  Craigslist · eBay Motors · CarMax · AutoTempest    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                  SCRAPER LAYER                      │
│   Apify Actors per platform + Python / Playwright   │
│   Residential proxies · Anti-detect browsers        │
│   Scheduled runs every 2–4 hours per source         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│             NORMALIZATION PIPELINE                  │
│   Standardize title · price · mileage · location    │
│   Deduplicate cross-platform listings               │
│   Extract year / make / model via NLP               │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                │
│           Unified listings schema (below)           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│               DEAL SCORING ENGINE                   │
│   Compare vs avg for same make/model/year/mileage   │
│   Flag listings 15%+ below market as deals          │
│   Score 0–100 per listing                           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                   DASHBOARD                         │
│        React frontend · Real-time filters           │
│     Price alerts · Saved searches · Deal feed       │
└─────────────────────────────────────────────────────┘
```

-----

## Database Schema

### Core Listings Table

```sql
CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          VARCHAR(50) NOT NULL,         -- 'facebook', 'cargurus', etc.
  external_id     VARCHAR(255),                 -- Original platform listing ID
  title           TEXT,
  price           INTEGER,                      -- In cents to avoid float issues
  mileage         INTEGER,
  year            SMALLINT,
  make            VARCHAR(100),
  model           VARCHAR(100),
  trim            VARCHAR(100),
  category        VARCHAR(50),                  -- 'car', 'truck', 'trailer', 'part', etc.
  condition       VARCHAR(20),                  -- 'new', 'used', 'salvage'
  location_city   VARCHAR(100),
  location_state  VARCHAR(50),
  location_zip    VARCHAR(20),
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  url             TEXT,
  images          JSONB,                        -- Array of image URLs
  raw_data        JSONB,                        -- Original scraped payload
  deal_score      SMALLINT,                     -- 0–100
  price_vs_avg    DECIMAL(5,2),                 -- % above/below market avg
  market_avg      INTEGER,                      -- Comparable market avg in cents
  is_active       BOOLEAN DEFAULT true,
  first_seen_at   TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  scraped_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_listings_make_model_year ON listings (make, model, year);
CREATE INDEX idx_listings_deal_score ON listings (deal_score DESC);
CREATE INDEX idx_listings_source ON listings (source);
CREATE INDEX idx_listings_category ON listings (category);
CREATE INDEX idx_listings_location ON listings (location_state, location_city);
CREATE INDEX idx_listings_price ON listings (price);
```

### Supporting Tables

```sql
-- User saved searches and alerts
CREATE TABLE price_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  make        VARCHAR(100),
  model       VARCHAR(100),
  year_min    SMALLINT,
  year_max    SMALLINT,
  price_max   INTEGER,
  mileage_max INTEGER,
  location    VARCHAR(100),
  radius_mi   INTEGER DEFAULT 100,
  channel     VARCHAR(20) DEFAULT 'email',     -- 'email', 'sms', 'push'
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Market average cache by make/model/year/mileage bracket
CREATE TABLE market_averages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make            VARCHAR(100),
  model           VARCHAR(100),
  year            SMALLINT,
  mileage_bracket VARCHAR(20),                 -- '0-25k', '25k-50k', etc.
  avg_price       INTEGER,
  sample_count    INTEGER,
  calculated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

-----

## Data Sources

|Platform            |Access Method     |Difficulty|Update Freq|
|--------------------|------------------|----------|-----------|
|eBay Motors         |Official API      |Very Low  |Real-time  |
|Craigslist          |RSS + Scraping    |Low       |1–2 hrs    |
|Cars.com            |Scraping          |Low       |2–4 hrs    |
|CarGurus            |Scraping          |Low-Med   |2–4 hrs    |
|AutoTrader          |Scraping          |Medium    |4–6 hrs    |
|CarMax              |Scraping          |Medium    |4–6 hrs    |
|Facebook Marketplace|Scraping + Proxies|High      |4–8 hrs    |

**Start with eBay Motors API** — free, official, zero risk. Use it to validate your scoring algorithm before investing in scraper infrastructure.

-----

## Deal Scoring Algorithm

```python
def calculate_deal_score(listing, market_avg):
    """
    Score a listing 0-100 based on how good the deal is.
    80–100 = Exceptional deal
    60–79  = Good deal
    40–59  = Fair price
    0–39   = Overpriced
    """
    if not market_avg or market_avg == 0:
        return None

    price_ratio = listing.price / market_avg
    discount_pct = (1 - price_ratio) * 100

    if discount_pct >= 30:
        score = 95
    elif discount_pct >= 20:
        score = 85
    elif discount_pct >= 15:
        score = 75
    elif discount_pct >= 10:
        score = 65
    elif discount_pct >= 5:
        score = 55
    elif discount_pct >= 0:
        score = 45
    else:
        score = max(0, int(45 + discount_pct))  # Negative = overpriced

    return score
```

-----

## Tech Stack

|Layer             |Technology                        |
|------------------|----------------------------------|
|Scraping          |Apify, Python, Playwright         |
|Proxies           |Bright Data / Oxylabs residential |
|Data Pipeline     |Python, Apache Airflow or Make.com|
|Database          |PostgreSQL (Supabase for MVP)     |
|Backend API       |FastAPI or Node.js / Express      |
|Frontend Dashboard|React, TailwindCSS                |
|Auth              |Supabase Auth / Clerk             |
|Payments          |Stripe                            |
|Alerts            |Resend (email), Twilio (SMS)      |
|Hosting           |Vercel (frontend), Railway (API)  |

-----

## Monetization Model

### Phase 1 — Launch (Month 1–2)

- **Affiliate referrals** — CarFax ($5–15), auto insurance ($40–80/policy), auto loans ($50–200/funded loan)
- Zero sales effort, immediate revenue from day one

### Phase 2 — Freemium (Month 2–3)

- **Free tier** — 10 deals/day, basic filters
- **Pro tier ($9–19/month)** — Unlimited deals, price alerts, deal score details, saved searches

### Phase 3 — Dealer Revenue (Month 3–6)

- **Lead generation** — Capture buyer intent, sell leads to local dealers ($20–150/lead)
- **Dealer subscriptions ($99–499/month)** — Featured listings, competitor price monitoring, market analytics

### Phase 4 — Scale (Month 6+)

- **White-label dashboards** ($500–2,000/month per dealership)
- **Data licensing** — Market trend reports to auction houses, fleet buyers
- **Seller verification badges** ($9.99 flat per seller)

### Cash Deal Monetization

Since many private transactions happen in cash off-platform, TORQ monetizes the surrounding journey:

|Touchpoint        |Product                   |Revenue|
|------------------|--------------------------|-------|
|Before purchase   |CarFax/AutoCheck report   |$5–15  |
|Before purchase   |Mobile inspection referral|$10–25 |
|Before purchase   |Loan pre-approval         |$50–200|
|During transaction|Bill of sale generator    |$4.99  |
|After purchase    |Insurance referral        |$40–80 |
|After purchase    |Extended warranty         |$15–40 |
|After purchase    |Registration service      |$5–15  |

-----

## Competitive Landscape

|Competitor |Strength                |Gap TORQ Fills                         |
|-----------|------------------------|---------------------------------------|
|CarGurus   |Traffic, deal scoring   |Only their listings, no private sellers|
|AutoTempest|Multi-source aggregation|Outdated UI, weak monetization         |
|iSeeCars   |Data depth, analysis    |Narrow audience, not actionable        |
|CarEdge    |Invoice data, trust     |Subscription heavy, car-only           |
|TrueCar    |Dealer network          |Dealer-biased, no private market       |

**TORQ’s edge:** First platform to combine dealer inventory AND private seller listings across ALL vehicle types (not just cars) with clean deal scoring and a modern UX.

-----

## MVP Roadmap

### Month 1 — Data Foundation

- Set up PostgreSQL schema
- Build eBay Motors API integration (easiest, official)
- Build CarGurus scraper
- Basic normalization pipeline
- Internal deal scoring algorithm

### Month 2 — Dashboard

- React dashboard with filters (make, model, year, price, location)
- Deal score display
- Basic user accounts

### Month 3 — Monetization Layer

- Affiliate links integrated (CarFax, insurance)
- Stripe subscription setup
- Price alert emails via Resend

### Month 4–6 — Growth

- Add Facebook Marketplace (with proxy layer)
- Add AutoTrader, Cars.com
- Lead gen system for dealers
- Mobile-responsive polish

-----

## Project Structure

```
torq/
├── scraper/
│   ├── sources/
│   │   ├── ebay_motors.py
│   │   ├── cargurus.py
│   │   ├── autotrader.py
│   │   ├── facebook.py
│   │   └── craigslist.py
│   ├── normalize.py
│   └── scheduler.py
├── api/
│   ├── routes/
│   │   ├── listings.py
│   │   ├── alerts.py
│   │   └── users.py
│   ├── scoring.py
│   └── main.py
├── dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── db/
│   ├── schema.sql
│   └── migrations/
├── torq-context.md        ← Claude terminal prompt file
└── README.md
```

-----

## Claude Terminal Prompt

A master context file (`torq-context.md`) is included in the project root. Use it to give Claude full project context in any session:

```bash
# Example usage
cat torq-context.md | claude "build the normalization pipeline"
cat torq-context.md | claude "write the CarGurus scraper"
cat torq-context.md | claude "create the deal scoring unit tests"
```

-----

## Brand

|Element   |Value                                 |
|----------|--------------------------------------|
|Name      |TORQ                                  |
|Domain    |torq.io                               |
|Tagline   |Every Rig. Every Deal. One Signal.    |
|Primary   |#FF3008 (Flame Red)                   |
|Secondary |#FF8C00 (Amber)                       |
|Neutral   |#C8D0D8 (Steel)                       |
|Background|#080A0C (Ink)                         |
|Font      |Bebas Neue (display) · Rajdhani (body)|

-----

## Legal Notes

- Scraping activities should be reviewed against each platform’s Terms of Service
- Facebook Marketplace scraping carries the highest legal/ban risk — treat as volatile data source
- eBay Motors official API is the only fully sanctioned data source at launch
- User data and lead information must comply with applicable privacy laws (GDPR, CCPA)

-----

## Status

> 🔧 **In Development** — Architecture phase

-----

*Built with obsession for the deal hunter in all of us.*