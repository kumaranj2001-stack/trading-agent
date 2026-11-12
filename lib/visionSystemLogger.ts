import { CurrencyPair, TimeFrame } from './types';

export interface AnticipatedLiquidityZone {
  min: number;
  max: number;
  label: string;
}

export interface EntryThresholdCriteria {
  liquiditySweepMet: boolean;
  goldenPocketOverlapMet: boolean;
  quantumConfluenceMet: boolean;
  dnaSimilarityMet: boolean;
  dangerBoundaryConfirmed: boolean;
  allCriteriaMet: boolean;
  score: number; // 0 to 5
}

export interface VisionLogEntry {
  id: string;
  timestamp: number;
  timestampFormatted: string;
  pair: CurrencyPair;
  timeframe: TimeFrame;
  livePrice: number;
  quantumVisionBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  bullishProbability: number;
  bearishProbability: number;
  marketDnaPrint: {
    similarityScore: number;
    liquiditySweepEvent: string;
    structureShift: string;
    regime: string;
  };
  visionAtlasConfig: {
    language: 'ta' | 'en';
    voiceActive: boolean;
    activeGrade: 'A+' | 'A' | 'B' | 'FILTERED_OUT';
  };
  thresholdCriteria: EntryThresholdCriteria;
  anticipatedLiquidityZones: {
    safeZone: AnticipatedLiquidityZone;
    entryZone: AnticipatedLiquidityZone;
    cautionZone: AnticipatedLiquidityZone;
    dangerZone: AnticipatedLiquidityZone;
  };
  verdict: 'HIGH_CONFIDENCE_ENTRY_TRIGGERED' | 'DEVELOPING_SETUP_MONITORING';
  recommendedAction?: {
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    riskRewardRatio: number;
  };
}

/**
 * 🛰️ VisionSystemLogger: Institutional Validation & Logging Framework
 *
 * Systemizes Quantum Vision bias, Market DNA prints, and Vision Atlas configurations.
 * Evaluates exact threshold criteria to isolate high-probability setups and maintain
 * a repeatable audit trail of execution accuracy over time.
 */
class VisionSystemLoggerService {
  private logs: VisionLogEntry[] = [];
  private readonly maxLogs: number = 100;
  private listeners: Set<(entry: VisionLogEntry) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('vision_atlas_telemetry_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      // Storage unavailable or invalid
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vision_atlas_telemetry_logs', JSON.stringify(this.logs.slice(-50)));
    } catch {
      // Ignore quota errors
    }
  }

  public subscribe(listener: (entry: VisionLogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Evaluate threshold criteria and record a telemetry snapshot.
   */
  public logSnapshot(params: {
    pair: CurrencyPair;
    timeframe: TimeFrame;
    livePrice: number;
    quantumVisionBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    bullishProbability: number;
    bearishProbability: number;
    marketDnaSimilarity: number;
    liquiditySweepEvent: string;
    structureShift: string;
    marketRegime: string;
    language: 'ta' | 'en';
    voiceActive: boolean;
    safeZone: { min: number; max: number };
    entryZone: { min: number; max: number };
    cautionZone: { min: number; max: number };
    dangerZone: { min: number; max: number };
  }): VisionLogEntry {
    // 1. Evaluate 5 Core Institutional Criteria
    const liquiditySweepMet = params.liquiditySweepEvent.toLowerCase().includes('swept') ||
      params.liquiditySweepEvent.toLowerCase().includes('sweep');
    
    const goldenPocketOverlapMet = params.entryZone.min > 0 && params.entryZone.max > params.entryZone.min;
    
    const maxProb = Math.max(params.bullishProbability, params.bearishProbability);
    const quantumConfluenceMet = maxProb >= 52;
    
    const dnaSimilarityMet = params.marketDnaSimilarity >= 60;
    
    const dangerBoundaryConfirmed = params.dangerZone.max > params.dangerZone.min;

    let score = 0;
    if (liquiditySweepMet) score++;
    if (goldenPocketOverlapMet) score++;
    if (quantumConfluenceMet) score++;
    if (dnaSimilarityMet) score++;
    if (dangerBoundaryConfirmed) score++;

    const allCriteriaMet = score >= 4; // High confidence when at least 4 of 5 align

    const activeGrade: 'A+' | 'A' | 'B' | 'FILTERED_OUT' = 
      score === 5 ? 'A+' : score === 4 ? 'A' : score >= 3 ? 'B' : 'FILTERED_OUT';

    const direction: 'BUY' | 'SELL' = params.bearishProbability >= params.bullishProbability ? 'SELL' : 'BUY';

    const entryMid = Number(((params.entryZone.min + params.entryZone.max) / 2).toFixed(4));
    const sl = direction === 'SELL' ? params.dangerZone.max : params.dangerZone.min;
    const tpDist = Math.abs(entryMid - sl) * 2.5;
    const tp = direction === 'SELL' ? Number((entryMid - tpDist).toFixed(4)) : Number((entryMid + tpDist).toFixed(4));

    const entry: VisionLogEntry = {
      id: `VLOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      timestampFormatted: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
      pair: params.pair,
      timeframe: params.timeframe,
      livePrice: params.livePrice,
      quantumVisionBias: params.quantumVisionBias,
      bullishProbability: params.bullishProbability,
      bearishProbability: params.bearishProbability,
      marketDnaPrint: {
        similarityScore: params.marketDnaSimilarity,
        liquiditySweepEvent: params.liquiditySweepEvent,
        structureShift: params.structureShift,
        regime: params.marketRegime,
      },
      visionAtlasConfig: {
        language: params.language,
        voiceActive: params.voiceActive,
        activeGrade,
      },
      thresholdCriteria: {
        liquiditySweepMet,
        goldenPocketOverlapMet,
        quantumConfluenceMet,
        dnaSimilarityMet,
        dangerBoundaryConfirmed,
        allCriteriaMet,
        score,
      },
      anticipatedLiquidityZones: {
        safeZone: { ...params.safeZone, label: 'SAFE ZONE' },
        entryZone: { ...params.entryZone, label: 'ENTRY ZONE' },
        cautionZone: { ...params.cautionZone, label: 'CAUTION ZONE' },
        dangerZone: { ...params.dangerZone, label: 'DANGER ZONE' },
      },
      verdict: allCriteriaMet ? 'HIGH_CONFIDENCE_ENTRY_TRIGGERED' : 'DEVELOPING_SETUP_MONITORING',
      recommendedAction: {
        direction,
        entry: entryMid,
        stopLoss: sl,
        takeProfit: tp,
        riskRewardRatio: 2.5,
      },
    };

    // Keep log buffer bounded
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.saveToStorage();
    this.listeners.forEach(fn => fn(entry));

    return entry;
  }

  public getRecentLogs(limit: number = 20): VisionLogEntry[] {
    return this.logs.slice(0, limit);
  }

  public getHighConfidenceSetups(): VisionLogEntry[] {
    return this.logs.filter(l => l.thresholdCriteria.allCriteriaMet);
  }

  public clearLogs(): void {
    this.logs = [];
    this.saveToStorage();
  }
}

export const visionSystemLogger = new VisionSystemLoggerService();
