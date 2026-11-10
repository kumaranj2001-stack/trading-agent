import { Candle, CurrencyPair, TimeFrame, OrderFlowSessionAnalysis, CandleFootprint, PriceLevelVolume, VolumeProfileBucket } from './types';
import { PIP_VALUES } from './marketData';

export class OrderFlowEngine {
  private static instance: OrderFlowEngine;

  private constructor() {}

  public static getInstance(): OrderFlowEngine {
    if (!OrderFlowEngine.instance) {
      OrderFlowEngine.instance = new OrderFlowEngine();
    }
    return OrderFlowEngine.instance;
  }

  /**
   * Synthesize real-time Order Flow, Footprint Matrix, and Volume Profile
   * based on authoritative live chart candles.
   */
  public analyzeSessionOrderFlow(
    symbol: CurrencyPair,
    timeframe: TimeFrame,
    candles: Candle[]
  ): OrderFlowSessionAnalysis {
    if (!candles || candles.length === 0) {
      return this.createEmptySession(symbol, timeframe);
    }

    const currentPrice = candles[candles.length - 1].close;
    const isGold = symbol.includes('XAU');
    const isSilver = symbol.includes('XAG');
    const isJpy = symbol.includes('JPY');
    const isIndian = symbol.includes('NIFTY') || symbol.includes('INR');
    const isOil = symbol.includes('WTI') || symbol.includes('BRENT');

    let decimals = 5;
    if (isIndian || isGold || isOil) decimals = 2;
    else if (isSilver || isJpy) decimals = 3;

    const pip = PIP_VALUES[symbol] || 0.0001;
    const tickStep = Number((pip * 2.5).toFixed(decimals));

    // Analyze each candle footprint
    const footprints: CandleFootprint[] = candles.slice(-14).map((c, cIdx) => {
      const isBull = c.close >= c.open;
      const low = Math.min(c.low, c.open, c.close);
      const high = Math.max(c.high, c.open, c.close);
      const span = Math.max(high - low, tickStep);
      const levelsCount = Math.min(10, Math.max(4, Math.round(span / tickStep)));

      const levels: PriceLevelVolume[] = [];
      let totalCandleVol = 0;
      let candleDelta = 0;
      let maxLevelVol = 0;
      let pocPrice = c.close;

      const stackedBuyImbalances: number[] = [];
      const stackedSellImbalances: number[] = [];

      for (let i = 0; i < levelsCount; i++) {
        const pLevel = Number((low + (span * (i / (levelsCount - 1 || 1)))).toFixed(decimals));
        
        // Base volume distribution centered around candle body
        const isNearBody = pLevel >= Math.min(c.open, c.close) && pLevel <= Math.max(c.open, c.close);
        const baseFactor = isNearBody ? 1.6 : 0.8;
        
        // Asymmetric bid/ask based on candle direction & momentum
        const buyerIntensity = isBull ? 0.62 : 0.41;
        const levelTotal = Math.round((c.volume / levelsCount) * baseFactor * (0.8 + Math.random() * 0.4));
        const askVol = Math.round(levelTotal * (buyerIntensity + (Math.random() - 0.5) * 0.15));
        const bidVol = Math.max(5, levelTotal - askVol);
        const delta = askVol - bidVol;

        const isBuyImbalance = askVol > bidVol * 3.0 && askVol > 40;
        const isSellImbalance = bidVol > askVol * 3.0 && bidVol > 40;

        if (isBuyImbalance) stackedBuyImbalances.push(pLevel);
        if (isSellImbalance) stackedSellImbalances.push(pLevel);

        if (levelTotal > maxLevelVol) {
          maxLevelVol = levelTotal;
          pocPrice = pLevel;
        }

        totalCandleVol += levelTotal;
        candleDelta += delta;

        levels.push({
          price: pLevel,
          bidVolume: bidVol,
          askVolume: askVol,
          totalVolume: levelTotal,
          delta,
          isImbalance: isBuyImbalance || isSellImbalance,
          imbalanceType: isBuyImbalance ? 'BUY_IMBALANCE' : isSellImbalance ? 'SELL_IMBALANCE' : undefined,
        });
      }

      return {
        candleIndex: cIdx,
        timestamp: c.timestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        levels: levels.sort((a, b) => b.price - a.price), // Highest price first
        totalCandleVolume: totalCandleVol,
        candleDelta,
        pocPrice,
        stackedBuyImbalances,
        stackedSellImbalances,
      };
    });

    // Synthesize Session-Wide Volume Profile across all candles
    const priceMap = new Map<number, { buy: number; sell: number; total: number }>();
    let sessionTotalVol = 0;
    let sessionBuyVol = 0;
    let sessionSellVol = 0;

    footprints.forEach(fp => {
      fp.levels.forEach(lvl => {
        const existing = priceMap.get(lvl.price) || { buy: 0, sell: 0, total: 0 };
        existing.buy += lvl.askVolume;
        existing.sell += lvl.bidVolume;
        existing.total += lvl.totalVolume;
        priceMap.set(lvl.price, existing);

        sessionTotalVol += lvl.totalVolume;
        sessionBuyVol += lvl.askVolume;
        sessionSellVol += lvl.bidVolume;
      });
    });

    // Find Point of Control (POC)
    let maxSessionVol = 0;
    let sessionPoc = currentPrice;

    priceMap.forEach((v, p) => {
      if (v.total > maxSessionVol) {
        maxSessionVol = v.total;
        sessionPoc = p;
      }
    });

    // Value Area Calculation (70% of total volume centered around POC)
    const sortedPrices = Array.from(priceMap.entries()).sort((a, b) => a[0] - b[0]);
    const targetValueAreaVol = sessionTotalVol * 0.70;
    let accumulatedVaVol = 0;
    const valueAreaSet = new Set<number>();

    // Start with POC
    valueAreaSet.add(sessionPoc);
    accumulatedVaVol += (priceMap.get(sessionPoc)?.total || 0);

    let pocIdx = sortedPrices.findIndex(item => item[0] === sessionPoc);
    if (pocIdx === -1) pocIdx = Math.floor(sortedPrices.length / 2);

    let up = pocIdx + 1;
    let down = pocIdx - 1;

    while (accumulatedVaVol < targetValueAreaVol && (up < sortedPrices.length || down >= 0)) {
      const volUp = up < sortedPrices.length ? sortedPrices[up][1].total : -1;
      const volDown = down >= 0 ? sortedPrices[down][1].total : -1;

      if (volUp >= volDown && volUp !== -1) {
        accumulatedVaVol += volUp;
        valueAreaSet.add(sortedPrices[up][0]);
        up++;
      } else if (volDown !== -1) {
        accumulatedVaVol += volDown;
        valueAreaSet.add(sortedPrices[down][0]);
        down--;
      } else {
        break;
      }
    }

    const valueAreaArray = Array.from(valueAreaSet).sort((a, b) => a - b);
    const valueAreaLow = valueAreaArray[0] || (currentPrice - tickStep * 4);
    const valueAreaHigh = valueAreaArray[valueAreaArray.length - 1] || (currentPrice + tickStep * 4);

    const volumeProfile: VolumeProfileBucket[] = sortedPrices.map(([price, vol]) => ({
      priceLevel: price,
      buyVolume: vol.buy,
      sellVolume: vol.sell,
      totalVolume: vol.total,
      volumePercent: Number(((vol.total / (sessionTotalVol || 1)) * 100).toFixed(1)),
      isPoc: price === sessionPoc,
      isValueArea: valueAreaSet.has(price),
    })).reverse(); // High price to low price

    // High & Low Volume Nodes
    const highVolumeNodes = volumeProfile.filter(v => v.volumePercent >= 12).map(v => v.priceLevel);
    const lowVolumeNodes = volumeProfile.filter(v => v.volumePercent <= 3).map(v => v.priceLevel);

    const buyVolumeRatio = Number(((sessionBuyVol / (sessionTotalVol || 1)) * 100).toFixed(1));
    const sellVolumeRatio = Number(((sessionSellVol / (sessionTotalVol || 1)) * 100).toFixed(1));
    const cumulativeDelta = sessionBuyVol - sessionSellVol;

    let cvdTrend: OrderFlowSessionAnalysis['cvdTrend'] = 'AGGRESSIVE_BUYING';
    if (cumulativeDelta < -150) cvdTrend = 'AGGRESSIVE_SELLING';
    else if (buyVolumeRatio >= 53) cvdTrend = 'AGGRESSIVE_BUYING';
    else if (sellVolumeRatio >= 53) cvdTrend = 'AGGRESSIVE_SELLING';
    else cvdTrend = cumulativeDelta >= 0 ? 'ABSORPTION_BUY' : 'ABSORPTION_SELL';

    // Institutional Order Block Footprints
    const institutionalOrderBlocks = [
      {
        type: 'DEMAND' as const,
        priceRange: [Number((valueAreaLow - tickStep).toFixed(decimals)), Number(valueAreaLow.toFixed(decimals))] as [number, number],
        volumeStacked: Math.round(sessionTotalVol * 0.28),
        mitigated: false,
      },
      {
        type: 'SUPPLY' as const,
        priceRange: [Number(valueAreaHigh.toFixed(decimals)), Number((valueAreaHigh + tickStep).toFixed(decimals))] as [number, number],
        volumeStacked: Math.round(sessionTotalVol * 0.31),
        mitigated: false,
      }
    ];

    return {
      symbol,
      timeframe,
      currentPrice,
      sessionVolume: sessionTotalVol,
      totalBuyVolume: sessionBuyVol,
      totalSellVolume: sessionSellVol,
      buyVolumeRatioPercent: buyVolumeRatio,
      sellVolumeRatioPercent: sellVolumeRatio,
      cumulativeVolumeDelta: cumulativeDelta,
      cvdTrend,
      pocPrice: sessionPoc,
      valueAreaHigh,
      valueAreaLow,
      highVolumeNodes,
      lowVolumeNodes,
      footprints,
      volumeProfile,
      institutionalOrderBlocks,
    };
  }

  private createEmptySession(symbol: CurrencyPair, timeframe: TimeFrame): OrderFlowSessionAnalysis {
    return {
      symbol,
      timeframe,
      currentPrice: 0,
      sessionVolume: 0,
      totalBuyVolume: 0,
      totalSellVolume: 0,
      buyVolumeRatioPercent: 50,
      sellVolumeRatioPercent: 50,
      cumulativeVolumeDelta: 0,
      cvdTrend: 'ABSORPTION_BUY',
      pocPrice: 0,
      valueAreaHigh: 0,
      valueAreaLow: 0,
      highVolumeNodes: [],
      lowVolumeNodes: [],
      footprints: [],
      volumeProfile: [],
      institutionalOrderBlocks: [],
    };
  }
}

export const orderFlowEngine = OrderFlowEngine.getInstance();
