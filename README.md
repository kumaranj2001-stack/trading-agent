# 📈 Qri Trader // Autonomous Multi-Agent Trading Swarm

A high-performance, **Vercel-deployable** multi-agent trading intelligence system architected around four specialized institutional roles: **Technical Analyst**, **Fundamental Analyst**, **Forex Market Analyst**, and **Risk Manager**.

Engineered for both **Global Forex Markets** and the **Indian Stock Market (NSE / BSE)** with live institutional **OANDA / TradingView charting** and an embedded **1,050+ Rule Institutional Knowledge Base** (525 Technical + 525 Fundamental rules) for high-accuracy, high-confidence entry execution.

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

### 3. 🧠 1,050+ Institutional Knowledge Base Rules (Stored for High-Confidence Entry)
To ensure high accuracy and eliminate false breakouts, the swarm is backed by a structured knowledge base of over 1,000 verified rules:
- **525 Technical Analysis Rules**:
  - Smart Money Concepts (Order Blocks, 3-bar Fair Value Gaps, Liquidity Sweeps, CHOCH, BOS)
  - Multi-Timeframe (MTF) confluence filters (15M - 1H - 4H - Daily alignment)
  - Moving Average ribbon compressions & golden/death crosses
  - RSI & MACD regular and hidden momentum divergences
  - Volatility contraction patterns (VCP) and Bollinger Band squeezes
  - Classic chart geometry & Volume Spread Analysis (VSA stopping volume, absorption)
  - Indian Market specific setups: 15-minute Opening Range Breakout (ORB), Central Pivot Range (CPR), VWAP institutional defense, Expiry day gamma blast setups.
- **525 Fundamental Analysis Rules**:
  - Central Bank rate differential rules (Fed, ECB, BOJ, BoE, RBI)
  - 2Y/10Y sovereign yield curve inversions & real interest rate spreads
  - CPI / Core PCE inflation surprises and stagflation thresholds
  - FII & DII institutional cash market buying/selling thresholds
  - Brent crude price shocks on Indian CAD and Rupee valuations
  - Corporate quarterly earnings beats/misses and sectoral margin guidance
  - Sovereign credit rating actions and geopolitical risk premia
  - Global Dollar Index (DXY) momentum transmission

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
