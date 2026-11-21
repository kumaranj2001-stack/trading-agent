import { 
  CurrencyPair, 
  MarketSegment, 
  TimeFrame, 
  Candle, 
  SwarmConsensusResult, 
  MarketSessionInfo 
} from './types';
import { BASE_PRICES, generateCandles, getMarketSegmentForSymbol } from './marketData';
import { MarketSessionManager } from './marketSessionManager';
import { stateLatchingEngine } from './stateLatchingEngine';
import { LiveMarketFeedManager } from './liveMarketFeed';
import { AutonomousSwarmEngine } from './autonomousSwarmEngine';
import { BrowserStorageManager } from './browserStorage';

export interface TradingState {
  activePair: CurrencyPair;
  marketSegment: MarketSegment;
  timeframe: TimeFrame;
  livePrice: number;
  candles: Candle[];
  rates: any[];
  consensus: SwarmConsensusResult | null;
  isMarketFrozen: boolean;
  sessionInfo: MarketSessionInfo | null;
  isSwitchingInstrument: boolean;
  isAnalyzing: boolean;
  lastMutationTimestamp: number;
  error: string | null;
}

export type TradingStoreListener = (state: TradingState) => void;
export type InstrumentMutationListener = (event: {
  previousPair: CurrencyPair;
  newPair: CurrencyPair;
  timeframe: TimeFrame;
  timestamp: number;
}) => void;

class TradingStoreImpl {
  private state: TradingState;
  private listeners: Set<TradingStoreListener> = new Set();
  private mutationListeners: Set<InstrumentMutationListener> = new Set();
  private abortController: AbortController | null = null;

  constructor() {
    const defaultPair: CurrencyPair = 'XAU/USD';
    const defaultTf: TimeFrame = '1h';
    const defaultSegment: MarketSegment = 'METALS_COMMODITIES';
    const sessionInfo = MarketSessionManager.getMarketSessionInfo(defaultPair);

    // Initial safe candles
    const initialCandles = generateCandles(defaultPair, defaultTf, 60);
    const initialPrice = initialCandles[initialCandles.length - 1]?.close || BASE_PRICES[defaultPair] || 3538.20;

    LiveMarketFeedManager.setCanonicalFeed(defaultPair, defaultTf, initialCandles);

    this.state = {
      activePair: defaultPair,
      marketSegment: defaultSegment,
      timeframe: defaultTf,
      livePrice: initialPrice,
      candles: initialCandles,
      rates: [],
      consensus: null,
      isMarketFrozen: sessionInfo.isFrozen,
      sessionInfo,
      isSwitchingInstrument: false,
      isAnalyzing: false,
      lastMutationTimestamp: Date.now(),
      error: null,
    };
  }

  public getState(): TradingState {
    return { ...this.state };
  }

  public subscribe(listener: TradingStoreListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onInstrumentMutated(listener: InstrumentMutationListener): () => void {
    this.mutationListeners.add(listener);
    return () => {
      this.mutationListeners.delete(listener);
    };
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('[TradingStore] Error in listener callback:', err);
      }
    });
  }

  private emitMutation(previousPair: CurrencyPair, newPair: CurrencyPair, timeframe: TimeFrame): void {
    const event = {
      previousPair,
      newPair,
      timeframe,
      timestamp: Date.now(),
    };
    this.mutationListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[TradingStore] Error in mutation listener:', err);
      }
    });
  }

  /**
   * Modifies active trading instrument across the entire global component tree.
   * Completely purges legacy stale state (e.g. Gold price ceilings and floors),
   * invalidates active state latches, updates underlying engines, and executes
   * reactive re-fetches for all subscribers.
   */
  public async setActivePair(newPair: CurrencyPair, immediateRefetch: boolean = true): Promise<void> {
    if (!newPair || (newPair === this.state.activePair && !immediateRefetch)) {
      return;
    }

    const previousPair = this.state.activePair;
    const timeframe = this.state.timeframe;
    const segment = getMarketSegmentForSymbol(newPair);
    const sessionInfo = MarketSessionManager.getMarketSessionInfo(newPair);
    const isFrozen = sessionInfo.isFrozen;

    // 1. Cancel any in-flight asynchronous operations for previous instrument
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    // 2. Immediately purge legacy state latches so Gold figures do NOT leak into Copper or other pairs
    stateLatchingEngine.forceRecalibrate(previousPair);
    stateLatchingEngine.forceRecalibrate(newPair);

    // 3. Immediately synthesize initial canonical candles for new pair for 0ms visual latency
    let newCandles = LiveMarketFeedManager.getCanonicalCandles(newPair, timeframe);
    if (!newCandles || newCandles.length === 0) {
      newCandles = generateCandles(newPair, timeframe, 60);
      LiveMarketFeedManager.setCanonicalFeed(newPair, timeframe, newCandles);
    }

    const newLivePrice = newCandles[newCandles.length - 1]?.close || BASE_PRICES[newPair] || 1.0;

    // 4. Atomic Global State Mutation: Immediately set consensus to null to avoid stale display
    this.state = {
      ...this.state,
      activePair: newPair,
      marketSegment: segment,
      livePrice: newLivePrice,
      candles: newCandles,
      consensus: null, // PURGE STALE CONSENSUS
      sessionInfo,
      isMarketFrozen: isFrozen,
      isSwitchingInstrument: true,
      isAnalyzing: true,
      lastMutationTimestamp: Date.now(),
      error: null,
    };

    // 5. Notify all listeners synchronously of instrument switch
    this.notify();
    this.emitMutation(previousPair, newPair, timeframe);

    // 6. Synchronize Non-React Singletons
    AutonomousSwarmEngine.updateScope(newPair, timeframe);
    LiveMarketFeedManager.startLiveFeed(newPair, timeframe);

    if (!immediateRefetch) {
      return;
    }

    // 7. Reactive Network Fetch & Autonomous Swarm Consensus Cycle for new instrument
    const signal = this.abortController.signal;

    try {
      // Step A: Ingest verified market candles from server REST endpoint
      const marketRes = await fetch(
        `/api/market?pair=${encodeURIComponent(newPair)}&timeframe=${encodeURIComponent(timeframe)}&count=60`,
        { signal }
      );
      const marketJson = await marketRes.json();

      let finalCandles = newCandles;
      let finalRates = this.state.rates;

      if (marketJson.success && marketJson.data) {
        if (marketJson.data.candles && marketJson.data.candles.length > 0) {
          finalCandles = marketJson.data.candles;
          LiveMarketFeedManager.setCanonicalFeed(newPair, timeframe, finalCandles);
        }
        if (marketJson.data.rates) {
          finalRates = marketJson.data.rates;
        }
      }

      // Step B: Run Autonomous Swarm Cycle explicitly for new pair
      const freshConsensus = await AutonomousSwarmEngine.executeAutonomousCycleForPair(
        newPair,
        timeframe,
        finalCandles
      );

      // Verify that active pair hasn't mutated again while request was in-flight
      if (this.state.activePair === newPair && !signal.aborted) {
        this.state = {
          ...this.state,
          candles: finalCandles,
          rates: finalRates,
          consensus: freshConsensus,
          livePrice: LiveMarketFeedManager.getCanonicalPrice(newPair),
          isSwitchingInstrument: false,
          isAnalyzing: false,
        };

        if (freshConsensus) {
          BrowserStorageManager.saveConsensusResult(freshConsensus);
        }

        this.notify();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(`[TradingStore] Failed to complete reactive refetch for ${newPair}:`, err);
        if (this.state.activePair === newPair) {
          this.state = {
            ...this.state,
            isSwitchingInstrument: false,
            isAnalyzing: false,
            error: err.message || 'Synchronization failure',
          };
          this.notify();
        }
      }
    }
  }

  /**
   * Modifies active timeframe across all analytical desks
   */
  public async setTimeframe(newTimeframe: TimeFrame): Promise<void> {
    if (newTimeframe === this.state.timeframe) return;

    this.state = {
      ...this.state,
      timeframe: newTimeframe,
      isAnalyzing: true,
      lastMutationTimestamp: Date.now(),
    };
    this.notify();

    AutonomousSwarmEngine.updateScope(this.state.activePair, newTimeframe);
    LiveMarketFeedManager.startLiveFeed(this.state.activePair, newTimeframe);

    try {
      const res = await fetch(
        `/api/market?pair=${encodeURIComponent(this.state.activePair)}&timeframe=${encodeURIComponent(newTimeframe)}&count=60`
      );
      const json = await res.json();
      if (json.success && json.data?.candles) {
        LiveMarketFeedManager.setCanonicalFeed(this.state.activePair, newTimeframe, json.data.candles);
        this.state.candles = json.data.candles;
      }

      const freshConsensus = await AutonomousSwarmEngine.executeAutonomousCycleForPair(
        this.state.activePair,
        newTimeframe,
        this.state.candles
      );

      this.state = {
        ...this.state,
        consensus: freshConsensus,
        isAnalyzing: false,
      };
      this.notify();
    } catch (err) {
      this.state.isAnalyzing = false;
      this.notify();
    }
  }

  public setMarketSegment(segment: MarketSegment): void {
    this.state = {
      ...this.state,
      marketSegment: segment,
      lastMutationTimestamp: Date.now(),
    };
    this.notify();
  }

  public updateMarketData(candles: Candle[], rates: any[], sessionInfo?: MarketSessionInfo): void {
    this.state = {
      ...this.state,
      candles: candles.length > 0 ? candles : this.state.candles,
      rates: rates.length > 0 ? rates : this.state.rates,
      sessionInfo: sessionInfo || this.state.sessionInfo,
      isMarketFrozen: sessionInfo ? sessionInfo.isFrozen : this.state.isMarketFrozen,
      lastMutationTimestamp: Date.now(),
    };
    this.notify();
  }

  public updateLivePrice(pair: CurrencyPair, livePrice: number): void {
    if (pair !== this.state.activePair) return;

    let updatedConsensus = this.state.consensus;
    if (updatedConsensus && updatedConsensus.pair === pair) {
      updatedConsensus = LiveMarketFeedManager.calibrateSwarmConsensus(updatedConsensus, livePrice);
    }

    this.state = {
      ...this.state,
      livePrice,
      consensus: updatedConsensus,
      lastMutationTimestamp: Date.now(),
    };
    this.notify();
  }

  public setConsensus(consensus: SwarmConsensusResult | null): void {
    // Parity guard: Only accept consensus if it matches activePair or is null
    if (consensus && consensus.pair !== this.state.activePair) {
      console.warn(`[TradingStore] Discarding mismatched consensus for ${consensus.pair} (active is ${this.state.activePair})`);
      return;
    }

    this.state = {
      ...this.state,
      consensus,
      isAnalyzing: false,
      lastMutationTimestamp: Date.now(),
    };
    this.notify();
  }

  public async forceRecalibrate(reason: string = 'Manual recalibration'): Promise<SwarmConsensusResult | null> {
    const pair = this.state.activePair;
    const tf = this.state.timeframe;

    stateLatchingEngine.forceRecalibrate(pair);

    this.state = {
      ...this.state,
      isAnalyzing: true,
      lastMutationTimestamp: Date.now(),
    };
    this.notify();

    const fresh = await AutonomousSwarmEngine.executeAutonomousCycleForPair(pair, tf, this.state.candles);
    if (this.state.activePair === pair) {
      this.state = {
        ...this.state,
        consensus: fresh,
        isAnalyzing: false,
      };
      this.notify();
    }
    return fresh;
  }
}

export const tradingStore = new TradingStoreImpl();
