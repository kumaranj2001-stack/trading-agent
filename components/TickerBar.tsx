'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { CurrencyPair, MarketSegment } from '@/lib/types';
import { FOREX_PAIRS, INDIAN_MARKET_ASSETS, METALS_COMMODITIES } from '@/lib/marketData';

interface TickerItem {
  pair: CurrencyPair;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
}

interface TickerBarProps {
  rates: TickerItem[];
  selectedPair: CurrencyPair;
  onSelectPair: (p: CurrencyPair) => void;
  marketSegment: MarketSegment;
}

export const TickerBar: React.FC<TickerBarProps> = ({ 
  rates, 
  selectedPair, 
  onSelectPair,
  marketSegment
}) => {
  const isIndian = marketSegment === 'INDIAN_MARKET';
  const isMetals = marketSegment === 'METALS_COMMODITIES';

  const displayRates = rates.filter(r => {
    if (isIndian) return INDIAN_MARKET_ASSETS.includes(r.pair);
    if (isMetals) return METALS_COMMODITIES.includes(r.pair);
    return FOREX_PAIRS.includes(r.pair);
  });

  return (
    <div className="bg-terminal-950 border-b border-terminal-border/80 px-3 sm:px-4 py-2 overflow-x-auto scrollbar-none touch-pan-x">
      <div className="flex items-center gap-2.5 min-w-max">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {isIndian ? '🇮🇳 NSE/BSE LIVE' : isMetals ? '🏆 PRECIOUS METALS & CRUDE' : '🌐 GLOBAL FX RATES'}
        </span>
        {displayRates.map((item) => {
          const isSelected = item.pair === selectedPair;
          const isPositive = item.change24h >= 0;
          const isJpy = item.pair.includes('JPY');
          const isIndianIndex = item.pair === 'NIFTY 50' || item.pair === 'BANK NIFTY';
          const isStock = item.pair === 'RELIANCE' || item.pair === 'TCS' || item.pair === 'HDFC BANK' || item.pair === 'INFY';
          const isGold = item.pair === 'XAU/USD';
          const isSilver = item.pair === 'XAG/USD';
          const isPlatinum = item.pair === 'XPT/USD';
          const isCopper = item.pair === 'COPPER';
          const isOil = item.pair === 'WTI_CRUDE' || item.pair === 'BRENT_CRUDE';

          let decimalCount = 5;
          if (isIndianIndex || isStock || isGold || isPlatinum || isOil) decimalCount = 2;
          else if (isSilver || isJpy || item.pair.includes('/INR')) decimalCount = 3;
          else if (isCopper) decimalCount = 4;

          const formatDisplayPrice = () => {
            if (isIndianIndex) return `₹${item.price.toLocaleString('en-IN')}`;
            if (isGold || isSilver || isPlatinum || isOil) return `$${item.price.toFixed(decimalCount)}`;
            return item.price.toFixed(decimalCount);
          };

          return (
            <button
              key={item.pair}
              onClick={() => onSelectPair(item.pair)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-xs sm:text-sm border ${
                isSelected 
                  ? 'bg-terminal-800/90 border-cyan-500/60 shadow-sm shadow-cyan-500/10' 
                  : 'bg-terminal-900/60 border-terminal-border hover:border-slate-500 hover:bg-terminal-800/50'
              }`}
            >
              <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                {item.pair}
              </span>
              <span className="text-white font-semibold">
                {formatDisplayPrice()}
              </span>
              <span className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                )}
                {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
