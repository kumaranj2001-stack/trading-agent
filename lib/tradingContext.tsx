'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  CurrencyPair, 
  MarketSegment, 
  TimeFrame, 
  Candle, 
  SwarmConsensusResult, 
  MarketSessionInfo 
} from './types';
import { tradingStore, TradingState } from './tradingStore';

export interface TradingContextValue extends TradingState {
  setActivePair: (pair: CurrencyPair, immediateRefetch?: boolean) => Promise<void>;
  setTimeframe: (timeframe: TimeFrame) => Promise<void>;
  setMarketSegment: (segment: MarketSegment) => void;
  updateLivePrice: (pair: CurrencyPair, livePrice: number) => void;
  updateMarketData: (candles: Candle[], rates: any[], sessionInfo?: MarketSessionInfo) => void;
  setConsensus: (consensus: SwarmConsensusResult | null) => void;
  forceRecalibrate: (reason?: string) => Promise<SwarmConsensusResult | null>;
}

const TradingContext = createContext<TradingContextValue | null>(null);

export interface TradingProviderProps {
  children: React.ReactNode;
  initialPair?: CurrencyPair;
  initialTimeframe?: TimeFrame;
}

export const TradingProvider: React.FC<TradingProviderProps> = ({
  children,
  initialPair,
  initialTimeframe,
}) => {
  const [storeState, setStoreState] = useState<TradingState>(() => tradingStore.getState());

  useEffect(() => {
    // Subscribe to store mutations
    const unsubscribe = tradingStore.subscribe((newState) => {
      setStoreState(newState);
    });

    // Optionally set initial pair if specified and different from current
    if (initialPair && initialPair !== storeState.activePair) {
      tradingStore.setActivePair(initialPair);
    }
    if (initialTimeframe && initialTimeframe !== storeState.timeframe) {
      tradingStore.setTimeframe(initialTimeframe);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const setActivePair = useCallback(async (pair: CurrencyPair, immediateRefetch: boolean = true) => {
    await tradingStore.setActivePair(pair, immediateRefetch);
  }, []);

  const setTimeframe = useCallback(async (tf: TimeFrame) => {
    await tradingStore.setTimeframe(tf);
  }, []);

  const setMarketSegment = useCallback((segment: MarketSegment) => {
    tradingStore.setMarketSegment(segment);
  }, []);

  const updateLivePrice = useCallback((pair: CurrencyPair, livePrice: number) => {
    tradingStore.updateLivePrice(pair, livePrice);
  }, []);

  const updateMarketData = useCallback((candles: Candle[], rates: any[], sessionInfo?: MarketSessionInfo) => {
    tradingStore.updateMarketData(candles, rates, sessionInfo);
  }, []);

  const setConsensus = useCallback((consensus: SwarmConsensusResult | null) => {
    tradingStore.setConsensus(consensus);
  }, []);

  const forceRecalibrate = useCallback(async (reason?: string) => {
    return await tradingStore.forceRecalibrate(reason);
  }, []);

  const contextValue: TradingContextValue = useMemo(() => ({
    ...storeState,
    setActivePair,
    setTimeframe,
    setMarketSegment,
    updateLivePrice,
    updateMarketData,
    setConsensus,
    forceRecalibrate,
  }), [
    storeState,
    setActivePair,
    setTimeframe,
    setMarketSegment,
    updateLivePrice,
    updateMarketData,
    setConsensus,
    forceRecalibrate,
  ]);

  return (
    <TradingContext.Provider value={contextValue}>
      {children}
    </TradingContext.Provider>
  );
};

export function useTradingContext(): TradingContextValue {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingContext must be used within a TradingProvider');
  }
  return context;
}

export function useActiveInstrument() {
  const {
    activePair,
    marketSegment,
    timeframe,
    livePrice,
    candles,
    rates,
    isMarketFrozen,
    sessionInfo,
    isSwitchingInstrument,
    setActivePair,
    setTimeframe,
    setMarketSegment,
  } = useTradingContext();

  return {
    activePair,
    marketSegment,
    timeframe,
    livePrice,
    candles,
    rates,
    isMarketFrozen,
    sessionInfo,
    isSwitchingInstrument,
    setActivePair,
    setTimeframe,
    setMarketSegment,
  };
}

export function useSwarmConsensus() {
  const {
    consensus,
    isAnalyzing,
    isSwitchingInstrument,
    lastMutationTimestamp,
    error,
    setConsensus,
    forceRecalibrate,
  } = useTradingContext();

  return {
    consensus,
    isAnalyzing,
    isSwitchingInstrument,
    lastMutationTimestamp,
    error,
    setConsensus,
    forceRecalibrate,
  };
}
