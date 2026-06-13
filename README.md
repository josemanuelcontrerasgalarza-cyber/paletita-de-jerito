# PopProfit

Premium POS and business management platform for entrepreneurs.

## Setup

### 1. Install
```bash
npm install
```

### 2. Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_init.sql` in the SQL Editor
3. Copy your URL and anon key from Settings → API

### 3. Environment
```bash
cp .env.local.example .env.local
# Add your Supabase keys
```

### 4. Run
```bash
npm run dev
```

## Demo Mode
Click **"⚡ Entrar con cuenta demo"** on the login page — no Supabase needed.

## Deploy to Vercel
Import the repo at [vercel.com/new](https://vercel.com/new) and add the two env vars.

## Features
- Dashboard with KPIs + revenue chart
- POS with cart + real-time profit calc
- Product catalog management
- Inventory tracking with low-stock alerts
- Full sales history
- Partner/investor management
- Reinvestment calculator
