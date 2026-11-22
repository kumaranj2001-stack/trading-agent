# 📈 Qri Trader // Autonomous Multi-Agent Trading Swarm

A high-performance, **Vercel-deployable** multi-agent trading intelligence system architected around four specialized institutional roles: **Technical Analyst**, **Fundamental Analyst**, **Forex Market Analyst**, and **Risk Manager**.

Engineered for both **Global Forex Markets** and the **Indian Stock Market (NSE / BSE)** with live institutional **OANDA / TradingView charting** and an embedded **2,100+ Rule Institutional Knowledge Base** (1,050+ Technical + 1,050+ Fundamental models across 8 orthogonal strategy families) for high-accuracy, high-confidence entry execution.

---

## 🌟 Key Capabilities & Features

### 1. 📊 Dual Market Coverage: Global Forex & Indian Stock Market
- **Forex Markets**: `EUR/USD`, `GBP/USD`, `USD/JPY`, `AUD/USD`, `USD/CAD`, `USD/CHF`, `NZD/USD`, `EUR/GBP`.
- **Indian Market (NSE/BSE)**: `NIFTY 50`, `BANK NIFTY`, `USD/INR`, `EUR/INR`, `GBP/INR`, `RELIANCE`, `TCS`, `HDFC BANK`, `INFY`.
- **Indian Market Specific Telemetry**:
  - Foreign Institutional Investors (FII) & DII daily cash market net flows (₹ Cr)
  - Reserve Bank of India (RBI) Repo Rate (6.50%) & liquidity stance
  - India VIX volatility gauge
  - NIFTY Put-Call Ratio (PCR)
  - GIFT Nifty sentiment delta
  - NSE session timings (09:15 - 15:30 IST)

### 2. 📈 Live OANDA & TradingView Chart Integration
- Embeds official institutional **OANDA / TradingView Live Charts** with real-time streaming feeds, multi-timeframe controls, drawing tools, and standard indicator suites.
- Toggle anytime between **OANDA Live Streaming Chart** and the **Apex Algorithmic Swarm Matrix Chart** with custom Smart Money Concepts (FVG, Order Blocks, Liquidity Sweeps, Dynamic Stop Loss & Take Profit brackets).

### 3. 🧠 2,100+ Institutional Knowledge Base Rules (Stored for High-Confidence Entry)
To ensure high accuracy and eliminate false breakouts, the swarm is backed by a structured knowledge base of over 2,100 verified quantitative rules across 8 orthogonal strategy families:
- **1,050+ Technical Analysis Rules**:
  - Smart Money Concepts & Order Flow (Order Blocks, 3-bar Fair Value Gaps, Liquidity Sweeps, CHOCH, BOS)
  - Auction Market Theory & CVD (Volume Profile POC/VAH/VAL, Cumulative Volume Delta, Bid/Ask Depth Imbalance)
  - Harmonic Geometry & Volatility Dynamics (Golden Pockets, Gartley/Bat confluences, ATR volatility expansions)
  - Multi-Timeframe Entry Protocols (15M - 1H - 4H - Daily alignment)
  - Statistical Arbitrage & Mean Reversion (Z-Score bands, Ornstein-Uhlenbeck mean reversion)
  - Multi-Timeframe Trend Stacks & Moving Average ribbon compressions
  - Statistical Arbitrage & Oscillators (RSI & MACD regular and hidden momentum divergences)
  - Price Action & Candlestick Absorptions (VSA stopping volume, institutional absorption)
  - Indian Market specific setups: 15-minute Opening Range Breakout (ORB), Central Pivot Range (CPR), VWAP institutional defense, Expiry day gamma blast setups.
- **1,050+ Fundamental Analysis Rules**:
  - Central Bank Policy & Interest Rate Trajectories (Fed, ECB, BOJ, BoE, RBI)
  - Real Yields & Sovereign Spreads (2Y/10Y sovereign yield curve inversions & real interest rate spreads)
  - COT Positioning & Institutional Flows (Commercial Hedger extremes, asset manager net positioning)
  - Inflation Dynamics & Surprises (CPI / Core PCE inflation surprises and stagflation thresholds)
  - Cross-Asset Commodity Linkages (Brent crude price shocks on Indian CAD and Rupee valuations)
  - Sovereign Debt & Balance of Payments (FII & DII institutional cash market buying/selling thresholds)
  - Corporate Earnings & Credit Quality (corporate quarterly earnings beats/misses and sectoral margin guidance)
  - Geopolitical & Carry Regimes (sovereign credit rating actions, geopolitical risk premia, DXY momentum transmission)

### 4. 🛡️ Risk Manager & 1,000-Path Monte Carlo Simulation
- **VETO Authority**: Automatic rejection of non-compliant setups.
- **Mathematical Sizing**: Fixed fractional sizing (1%–1.5% equity) with minimum 1:1.8 Risk-to-Reward enforcement.
- **Monte Carlo Engine**: Runs 1,000 stochastic price simulations to project 95% & 99% Value-at-Risk (VaR), win probability, and expected drawdown.

### 5. ⚡ Autonomous Swarm Autopilot & Multi-Turn Debate
- **Execution Modes**: `Manual Approval`, `Semi-Autonomous`, or `Full Autopilot (Autonomous Swarm Execution)`.
- **Multi-Turn Debate Room**: 3-round cross-examination protocol where the 4 agents challenge each other's assumptions before the Risk Manager issues a verdict.
- **Multi-Pair Opportunity Scanner (Radar)**: Continuous screener ranking all Forex and Indian market assets by Confluence Grade (`A+`, `A`, `B`, `C`, `F`).

---

## 🏛️ The Four Assigned Roles

| Role | Specialist Agent | Primary Responsibilities |
|---|---|---|
| **Role 1** | **Technical Analyst** | Price action, SMC Order Blocks, FVGs, EMA 20/50/200, RSI, MACD, 500+ Technical Rules |
| **Role 2** | **Fundamental Analyst** | Macro regimes, central banks, RBI policy, 2Y/10Y yield curves, FII/DII flows, 500+ Fundamental Rules |
| **Role 3** | **Forex Market Analyst** | Currency Strength Index, DXY trend, carry trade spreads, cross-correlations, session liquidity |
| **Role 4** | **Risk Manager** | Capital preservation, position sizing, bracket orders, Monte Carlo VaR, **absolute VETO power** |

---

## 🚀 Vercel Deployment Guide

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import this repository.
4. Next.js is automatically detected (`vercel.json` included).
5. Click **"Deploy"**.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build and launch production server locally
npm run build
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
