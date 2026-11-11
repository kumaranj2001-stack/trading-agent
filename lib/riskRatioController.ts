import { ConfluenceGrade, TierRiskParameter, RiskRatioControllerConfig } from './types';

// ============================================================================
// RISK RATIO CONTROLLER // DYNAMIC TIERED SIZING & ZERO-VETO ENGINE
// ============================================================================

export const DEFAULT_TIER_RISK_CONFIG: RiskRatioControllerConfig = {
  zeroVetoEnforced: true,
  dynamicSizingEnabled: true,
  minConservativeLots: 0.01,
  maxInstitutionalLots: 5.0,
  tiers: {
    'A+': {
      grade: 'A+',
      name: 'Grade A+ (Institutional High-Conviction Core)',
      minConfidence: 85,
      defaultLots: 1.00,
      minLots: 0.90,
      maxLots: 1.50,
      accountRiskPercent: 2.0,
      targetRRRatio: 3.2,
      executionPolicy: 'Full pip allocation. Prime multi-desk confluence across 525 technical and 525 macro strategies.',
    },
    'A': {
      grade: 'A',
      name: 'Grade A (Primary Alpha Trend Expansion)',
      minConfidence: 70,
      defaultLots: 0.75,
      minLots: 0.60,
      maxLots: 0.85,
      accountRiskPercent: 1.5,
      targetRRRatio: 2.8,
      executionPolicy: 'Proportional alpha sizing (0.60 to 0.85 lots). Validated liquidity sweeps & order flow confirmation.',
    },
    'B': {
      grade: 'B',
      name: 'Grade B (Standard Multi-Desk Confluence)',
      minConfidence: 58,
      defaultLots: 0.50,
      minLots: 0.40,
      maxLots: 0.55,
      accountRiskPercent: 1.2,
      targetRRRatio: 2.4,
      executionPolicy: 'Balanced institutional volume (0.40 to 0.55 lots). Robust statistical probability with risk cap.',
    },
    'C': {
      grade: 'C',
      name: 'Grade C (Controlled Regime Position)',
      minConfidence: 46,
      defaultLots: 0.30,
      minLots: 0.25,
      maxLots: 0.35,
      accountRiskPercent: 1.0,
      targetRRRatio: 2.0,
      executionPolicy: 'Controlled risk tier (0.25 to 0.35 lots) for moderate directional bias under range conditions.',
    },
    'D': {
      grade: 'D',
      name: 'Grade D (Secondary Momentum Allocation)',
      minConfidence: 34,
      defaultLots: 0.18,
      minLots: 0.15,
      maxLots: 0.20,
      accountRiskPercent: 0.8,
      targetRRRatio: 1.8,
      executionPolicy: 'Defensive allocation (0.15 to 0.20 lots). Dynamic trailing stop protection enforced.',
    },
    'E': {
      grade: 'E',
      name: 'Grade E (Conservative Scout Allocation)',
      minConfidence: 20,
      defaultLots: 0.08,
      minLots: 0.05,
      maxLots: 0.10,
      accountRiskPercent: 0.5,
      targetRRRatio: 1.5,
      executionPolicy: 'Conservative scout volume (0.05 to 0.10 lots). Hard vetoes overridden with conservative positioning.',
    },
    'F': {
      grade: 'F',
      name: 'Grade F (Ultra-Conservative Micro-Volume - Zero Veto)',
      minConfidence: 0,
      defaultLots: 0.01,
      minLots: 0.01,
      maxLots: 0.04,
      accountRiskPercent: 0.2,
      targetRRRatio: 1.2,
      executionPolicy: 'Minimum conservative exploratory volume (0.01 lots). Decouples trade entry from rigid swarm vetoes.',
    },
  },
  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY = 'qri_risk_ratio_controller_config';

export class RiskRatioController {
  private static instance: RiskRatioController;
  private currentConfig: RiskRatioControllerConfig;

  private constructor() {
    this.currentConfig = { ...DEFAULT_TIER_RISK_CONFIG };
    this.loadFromStorage();
  }

  public static getInstance(): RiskRatioController {
    if (!RiskRatioController.instance) {
      RiskRatioController.instance = new RiskRatioController();
    }
    return RiskRatioController.instance;
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.currentConfig = {
            ...DEFAULT_TIER_RISK_CONFIG,
            ...parsed,
            tiers: {
              ...DEFAULT_TIER_RISK_CONFIG.tiers,
              ...(parsed.tiers || {}),
            },
          };
        }
      } catch (e) {
        console.error('Failed to load RiskRatioController config from localStorage:', e);
      }
    }
  }

  public saveToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentConfig));
      } catch (e) {
        console.error('Failed to persist RiskRatioController config to localStorage:', e);
      }
    }
  }

  public getConfig(): RiskRatioControllerConfig {
    return { ...this.currentConfig };
  }

  public updateConfig(newConfig: Partial<RiskRatioControllerConfig>): RiskRatioControllerConfig {
    this.currentConfig = {
      ...this.currentConfig,
      ...newConfig,
      tiers: {
        ...this.currentConfig.tiers,
        ...(newConfig.tiers || {}),
      },
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.getConfig();
  }

  public resetToDefaults(): RiskRatioControllerConfig {
    this.currentConfig = { ...DEFAULT_TIER_RISK_CONFIG, lastUpdated: new Date().toISOString() };
    this.saveToStorage();
    return this.getConfig();
  }

  /**
   * Derives a 7-tier institutional confluence grade strictly from multi-agent confidence score
   */
  public deriveGradeFromConfidence(confidence: number, hasDivergence: boolean = false): ConfluenceGrade {
    if (hasDivergence && confidence < 50) return 'E';
    if (confidence >= 85) return 'A+';
    if (confidence >= 70) return 'A';
    if (confidence >= 58) return 'B';
    if (confidence >= 46) return 'C';
    if (confidence >= 34) return 'D';
    if (confidence >= 20) return 'E';
    return 'F';
  }

  /**
   * Retrieves stored institutional risk parameters for the given grade
   */
  public getTierParameters(grade: ConfluenceGrade): TierRiskParameter {
    const tier = this.currentConfig.tiers[grade];
    if (tier) return { ...tier };
    return { ...this.currentConfig.tiers['F'] };
  }

  /**
   * Calculates dynamic lot sizing driven strictly by the assigned confidence grade.
   * Eliminates VETOED states by guaranteeing a minimum conservative volume (0.01 lots for Grade F).
   */
  public calculateDynamicLotSize(
    grade: ConfluenceGrade,
    accountBalance: number = 25000,
    stopDistancePips: number = 30,
    isVetoTriggered: boolean = false
  ): {
    lotSize: number;
    riskPercent: number;
    targetRR: number;
    dollarRisk: number;
    policy: string;
    isVetoOverridden: boolean;
  } {
    // If a circuit breaker was triggered, downscale to Grade E or Grade F conservative volume
    const effectiveGrade: ConfluenceGrade = isVetoTriggered && (grade === 'A+' || grade === 'A' || grade === 'B')
      ? 'E'
      : (isVetoTriggered ? 'F' : grade);

    const tier = this.getTierParameters(effectiveGrade);

    // Dynamic sizing enforced strictly by tier
    let lotSize = tier.defaultLots;

    // Safety guardrails: clamp between minConservativeLots (0.01) and maxInstitutionalLots (5.0)
    lotSize = Math.max(this.currentConfig.minConservativeLots, Math.min(this.currentConfig.maxInstitutionalLots, lotSize));
    lotSize = Number(lotSize.toFixed(2));

    const dollarRisk = Number(((accountBalance * tier.accountRiskPercent) / 100).toFixed(2));

    return {
      lotSize,
      riskPercent: tier.accountRiskPercent,
      targetRR: tier.targetRRRatio,
      dollarRisk,
      policy: tier.executionPolicy,
      isVetoOverridden: isVetoTriggered,
    };
  }
}

export const riskRatioController = RiskRatioController.getInstance();
