import { CurrencyPair, MarketCloseEvent, MarketCloseEventType, MarketSegment, MarketSessionInfo, MarketSessionStatus } from './types';
import { BASE_PRICES, getMarketSegmentForSymbol } from './marketData';

export type MarketCloseListener = (event: MarketCloseEvent) => void;

/**
 * 🏛️ MarketSessionManager: Automated Market Close & Global State Freeze Engine
 *
 * Implements an automated event listener architecture that monitors trading
 * sessions across Forex, Commodities/Metals, and Indian NSE markets.
 *
 * Upon market close (weekend, after-hours, or maintenance break), it instantly
 * triggers a GLOBAL STATE FREEZE that halts asynchronous background workers,
 * synthetic micro-tickers, and portfolio recalculators, suppressing any phantom
 * updates or pricing drift and guaranteeing absolute pricing integrity.
 */
export class MarketSessionManager {
  private static listeners: Set<MarketCloseListener> = new Set();
  private static manualFreeze: boolean = false;
  private static frozenPrices: Map<CurrencyPair, number> = new Map();
  private static previousStatusMap: Map<CurrencyPair, MarketSessionStatus> = new Map();
  private static heartbeatTimer: NodeJS.Timeout | null = null;
  private static isInitialized: boolean = false;

  /**
   * Calculate precise market session info for a symbol at a given date.
   */
  public static getMarketSessionInfo(pair: CurrencyPair, targetDate: Date = new Date()): MarketSessionInfo {
    const segment = getMarketSegmentForSymbol(pair);
    const utcDay = targetDate.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    const utcHour = targetDate.getUTCHours();
    const utcMinute = targetDate.getUTCMinutes();
    const utcTimeInMinutes = utcHour * 60 + utcMinute;

    // IST time calculation (UTC + 5 hours 30 mins)
    const istTotalMinutes = utcTimeInMinutes + 330;
    const istDay = (utcDay + Math.floor(istTotalMinutes / 1440)) % 7;
    const istHour = Math.floor((istTotalMinutes / 60) % 24);
    const istMinute = istTotalMinutes % 60;
    const istTimeInMinutes = istHour * 60 + istMinute;

    let isOpen = false;
    let status: MarketSessionStatus = 'OPEN';
    let statusLabel = 'ACTIVE TRADING';
    let sessionName = 'REGULAR SESSION';
    let reason = 'Market is actively trading with real-time liquidity.';
    let nextOpenDate: Date | null = null;

    if (this.manualFreeze) {
      isOpen = false;
      status = 'MANUAL_FREEZE';
      statusLabel = 'MANUAL GLOBAL FREEZE';
      sessionName = 'EMERGENCY STATE FREEZE';
      reason = 'Global state manually frozen by risk governance or trader override.';
    } else if (segment === 'INDIAN_MARKET') {
      // NSE India: Monday - Friday 09:15 to 15:30 IST (03:45 to 10:00 UTC)
      const isIsteWeekend = istDay === 0 || istDay === 6; // Sunday or Saturday
      const nseOpenMinutes = 9 * 60 + 15; // 09:15 IST
      const nseCloseMinutes = 15 * 60 + 30; // 15:30 IST

      if (isIsteWeekend) {
        isOpen = false;
        status = 'CLOSED_WEEKEND';
        statusLabel = 'NSE WEEKEND CLOSE';
        sessionName = 'NSE INDIA WEEKEND FREEZE';
        reason = 'National Stock Exchange of India (NSE) is closed for the weekend. State is frozen.';
        
        // Next open: Next Monday at 09:15 IST
        const daysUntilMonday = (8 - istDay) % 7 || 7;
        nextOpenDate = new Date(targetDate);
        nextOpenDate.setUTCDate(nextOpenDate.getUTCDate() + (daysUntilMonday === 0 ? 1 : daysUntilMonday));
        // 09:15 IST is 03:45 UTC
        nextOpenDate.setUTCHours(3, 45, 0, 0);
      } else if (istTimeInMinutes < nseOpenMinutes) {
        isOpen = false;
        status = 'CLOSED_AFTER_HOURS';
        statusLabel = 'NSE PRE-MARKET';
        sessionName = 'NSE PRE-OPEN FREEZE';
        reason = 'NSE market opens at 09:15 IST (03:45 UTC). State is frozen until open bell.';
        nextOpenDate = new Date(targetDate);
        nextOpenDate.setUTCHours(3, 45, 0, 0);
      } else if (istTimeInMinutes > nseCloseMinutes) {
        isOpen = false;
        status = 'CLOSED_AFTER_HOURS';
        statusLabel = 'NSE POST-MARKET';
        sessionName = 'NSE AFTER-HOURS FREEZE';
        reason = 'NSE regular market closed at 15:30 IST. State is frozen until next business day.';
        
        // Next open: Tuesday-Friday 09:15 IST, or Monday if Friday
        const isFriday = istDay === 5;
        const addDays = isFriday ? 3 : 1;
        nextOpenDate = new Date(targetDate);
        nextOpenDate.setUTCDate(nextOpenDate.getUTCDate() + addDays);
        nextOpenDate.setUTCHours(3, 45, 0, 0);
      } else {
        isOpen = true;
        status = 'OPEN';
        statusLabel = 'NSE MARKET OPEN';
        sessionName = 'NSE REGULAR HOURS (09:15 - 15:30 IST)';
        reason = 'NSE equity and derivative trading active.';
      }
    } else if (segment === 'METALS_COMMODITIES') {
      // COMEX / NYMEX Metals & Energy:
      // Opens Sunday 23:00 UTC (6:00 PM EST)
      // Closes Friday 22:00 UTC (5:00 PM EST)
      // Daily maintenance break: Mon - Thu 22:00 to 23:00 UTC
      const isWeekendClose = 
        (utcDay === 5 && utcTimeInMinutes >= 22 * 60) || // Friday after 22:00 UTC
        (utcDay === 6) ||                                // All Saturday
        (utcDay === 0 && utcTimeInMinutes < 23 * 60);    // Sunday before 23:00 UTC

      const isDailyBreak = 
        (utcDay >= 1 && utcDay <= 4) && 
        (utcTimeInMinutes >= 22 * 60 && utcTimeInMinutes < 23 * 60);

      if (isWeekendClose) {
        isOpen = false;
        status = 'CLOSED_WEEKEND';
        statusLabel = 'COMEX WEEKEND CLOSE';
        sessionName = 'METALS & CRUDE WEEKEND FREEZE';
        reason = 'Global commodity exchanges (COMEX/NYMEX) closed for weekend. State frozen.';
        
        // Next open: Sunday 23:00 UTC
        const daysUntilSunday = (7 - utcDay) % 7;
        nextOpenDate = new Date(targetDate);
        if (utcDay !== 0) {
          nextOpenDate.setUTCDate(nextOpenDate.getUTCDate() + daysUntilSunday);
        }
        nextOpenDate.setUTCHours(23, 0, 0, 0);
      } else if (isDailyBreak) {
        isOpen = false;
        status = 'CLOSED_DAILY_MAINTENANCE';
        statusLabel = 'DAILY MAINTENANCE BREAK';
        sessionName = 'COMEX DAILY SETTLEMENT BREAK';
        reason = 'Exchange daily clearing and maintenance break (22:00 - 23:00 UTC). Tickers locked.';
        nextOpenDate = new Date(targetDate);
        nextOpenDate.setUTCHours(23, 0, 0, 0);
      } else {
        isOpen = true;
        status = 'OPEN';
        statusLabel = 'COMMODITIES ACTIVE';
        sessionName = 'COMEX/NYMEX 24H LIQUIDITY';
        reason = 'Continuous spot and futures trading active.';
      }
    } else {
      // FOREX MAJORS:
      // Opens Sunday 22:00 UTC (5:00 PM EST)
      // Closes Friday 22:00 UTC (5:00 PM EST)
      // Open 24h continuously between Sunday 22:00 UTC and Friday 22:00 UTC
      const isWeekendClose = 
        (utcDay === 5 && utcTimeInMinutes >= 22 * 60) || // Friday after 22:00 UTC
        (utcDay === 6) ||                                // All Saturday
        (utcDay === 0 && utcTimeInMinutes < 22 * 60);    // Sunday before 22:00 UTC

      if (isWeekendClose) {
        isOpen = false;
        status = 'CLOSED_WEEKEND';
        statusLabel = 'GLOBAL FX WEEKEND CLOSE';
        sessionName = 'INTERBANK FX WEEKEND FREEZE';
        reason = 'Global interbank forex market is closed for the weekend. State is frozen.';
        
        // Next open: Sunday 22:00 UTC
        const daysUntilSunday = (7 - utcDay) % 7;
        nextOpenDate = new Date(targetDate);
        if (utcDay !== 0) {
          nextOpenDate.setUTCDate(nextOpenDate.getUTCDate() + daysUntilSunday);
        }
        nextOpenDate.setUTCHours(22, 0, 0, 0);
      } else {
        isOpen = true;
        status = 'OPEN';
        statusLabel = 'INTERBANK FX ACTIVE';

        // Categorize active sub-session
        if (utcHour >= 13 && utcHour <= 16) {
          sessionName = 'LONDON / NY OVERLAP (PEAK LIQUIDITY)';
        } else if (utcHour >= 8 && utcHour < 13) {
          sessionName = 'LONDON SESSION';
        } else if (utcHour > 16 && utcHour <= 21) {
          sessionName = 'NEW YORK SESSION';
        } else if (utcHour >= 0 && utcHour < 8) {
          sessionName = 'TOKYO / ASIAN SESSION';
        } else {
          sessionName = 'SYDNEY / WELLINGTON OPEN';
        }
        reason = 'Interbank multi-dealer market trading actively.';
      }
    }

    const isFrozen = !isOpen || this.manualFreeze;

    // Calculate time until next open
    let secondsUntilOpen = 0;
    let nextOpenFormatted = 'Trading Active';

    if (isFrozen && nextOpenDate) {
      const diffMs = nextOpenDate.getTime() - targetDate.getTime();
      secondsUntilOpen = Math.max(0, Math.floor(diffMs / 1000));
      
      const hours = Math.floor(secondsUntilOpen / 3600);
      const minutes = Math.floor((secondsUntilOpen % 3600) / 60);
      const secs = secondsUntilOpen % 60;
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const openDayName = dayNames[nextOpenDate.getUTCDay()];
      const openUtcTime = `${String(nextOpenDate.getUTCHours()).padStart(2, '0')}:${String(nextOpenDate.getUTCMinutes()).padStart(2, '0')} UTC`;
      
      nextOpenFormatted = `${openDayName} ${openUtcTime} (${hours}h ${minutes}m ${secs}s)`;
    }

    const lastClosePrice = this.getFrozenPrice(pair);

    return {
      pair,
      segment,
      isOpen,
      isFrozen,
      status,
      statusLabel,
      sessionName,
      nextOpenDate: nextOpenDate ? nextOpenDate.toISOString() : undefined,
      nextOpenFormatted,
      secondsUntilOpen,
      reason,
      lastClosePrice,
    };
  }

  /**
   * Check if a market is currently open.
   */
  public static isMarketOpen(pair: CurrencyPair): boolean {
    return this.getMarketSessionInfo(pair).isOpen;
  }

  /**
   * Check if state is frozen for a market.
   */
  public static isMarketFrozen(pair: CurrencyPair): boolean {
    return this.getMarketSessionInfo(pair).isFrozen;
  }

  /**
   * Get the locked closing price for a symbol.
   */
  public static getFrozenPrice(pair: CurrencyPair): number {
    if (this.frozenPrices.has(pair)) {
      return this.frozenPrices.get(pair)!;
    }
    const base = BASE_PRICES[pair] || 1.0;
    this.frozenPrices.set(pair, base);
    return base;
  }

  /**
   * Store the official closing price for state freezing.
   */
  public static setFrozenPrice(pair: CurrencyPair, price: number): void {
    if (price && price > 0) {
      this.frozenPrices.set(pair, price);
    }
  }

  /**
   * Bulk lock prices upon market closure.
   */
  public static lockPrices(prices: Partial<Record<CurrencyPair, number>>): void {
    Object.entries(prices).forEach(([pair, price]) => {
      if (typeof price === 'number' && price > 0) {
        this.frozenPrices.set(pair as CurrencyPair, price);
      }
    });
  }

  /**
   * Toggle manual freeze mode (for emergency circuit breakers or testing).
   */
  public static setManualFreeze(frozen: boolean): void {
    if (this.manualFreeze !== frozen) {
      this.manualFreeze = frozen;
      this.notifyAllSubscribers(frozen ? 'GLOBAL_FREEZE' : 'RESUME_TRADING');
    }
  }

  public static isManualFreeze(): boolean {
    return this.manualFreeze;
  }

  /**
   * Automated Event Heartbeat: Monitors session boundaries every 1,000ms.
   * If any market transitions from OPEN to CLOSED, it emits MARKET_CLOSED and locks state.
   */
  public static initializeHeartbeat(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Run initial check and notify immediately if closed
    this.checkSessionTransitions();

    this.heartbeatTimer = setInterval(() => {
      this.checkSessionTransitions();
    }, 1000);
  }

  /**
   * Check all symbols for status transitions and fire automated events.
   */
  private static checkSessionTransitions(): void {
    const now = new Date();
    const symbols = Object.keys(BASE_PRICES) as CurrencyPair[];

    for (const symbol of symbols) {
      const info = this.getMarketSessionInfo(symbol, now);
      const prevStatus = this.previousStatusMap.get(symbol);

      if (prevStatus === undefined) {
        this.previousStatusMap.set(symbol, info.status);
        if (info.isFrozen) {
          // Emit initial freeze event on boot if already closed
          this.emitEvent({
            type: 'MARKET_CLOSED',
            pair: symbol,
            segment: info.segment,
            isFrozen: true,
            frozenPrice: info.lastClosePrice,
            sessionInfo: info,
            timestamp: now.getTime(),
          });
        }
      } else if (prevStatus !== info.status) {
        this.previousStatusMap.set(symbol, info.status);
        const eventType: MarketCloseEventType = info.isOpen ? 'MARKET_OPENED' : 'MARKET_CLOSED';
        this.emitEvent({
          type: eventType,
          pair: symbol,
          segment: info.segment,
          isFrozen: info.isFrozen,
          frozenPrice: info.lastClosePrice,
          sessionInfo: info,
          timestamp: now.getTime(),
        });
      }
    }
  }

  /**
   * Subscribe to automated market close and freeze events.
   */
  public static subscribe(listener: MarketCloseListener): () => void {
    this.listeners.add(listener);
    this.initializeHeartbeat();

    return () => {
      this.listeners.delete(listener);
    };
  }

  private static emitEvent(event: MarketCloseEvent): void {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('Error in MarketCloseListener:', err);
      }
    });
  }

  private static notifyAllSubscribers(type: MarketCloseEventType): void {
    const now = new Date();
    const symbols = Object.keys(BASE_PRICES) as CurrencyPair[];
    for (const pair of symbols) {
      const info = this.getMarketSessionInfo(pair, now);
      this.emitEvent({
        type,
        pair,
        segment: info.segment,
        isFrozen: info.isFrozen,
        frozenPrice: info.lastClosePrice,
        sessionInfo: info,
        timestamp: now.getTime(),
      });
    }
  }

  /**
   * Stop automated heartbeat (for cleanup or testing).
   */
  public static destroy(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.isInitialized = false;
    this.listeners.clear();
  }
}
