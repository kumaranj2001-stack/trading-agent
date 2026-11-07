import { ExecutionMode, Position, SwarmConsensusResult, TradeHistoryItem } from './types';
import { PortfolioState, INITIAL_PORTFOLIO } from './store';
import { DEFAULT_RISK_CONFIG, RiskManagerConfig } from './agents/RiskManager';

const STORAGE_KEYS = {
  PORTFOLIO: 'apex_storage_portfolio_v2',
  RISK_CONFIG: 'apex_storage_risk_config_v2',
  EXECUTION_MODE: 'apex_storage_execution_mode_v2',
  NEWS_CACHE: 'apex_storage_news_cache_v2',
  CONSENSUS_HISTORY: 'apex_storage_consensus_history_v2',
  THEME: 'apex_storage_theme_v2',
};

const isBrowser = typeof window !== 'undefined';

export class BrowserStorageManager {
  // 1. Portfolio Persistence
  public static loadPortfolio(): PortfolioState {
    if (!isBrowser) return INITIAL_PORTFOLIO;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...INITIAL_PORTFOLIO,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('Error reading portfolio from browser localStorage:', e);
    }
    return INITIAL_PORTFOLIO;
  }

  public static savePortfolio(portfolio: PortfolioState): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
    } catch (e) {
      console.warn('Error saving portfolio to browser localStorage:', e);
    }
  }

  // 2. Risk Manager Config Persistence
  public static loadRiskConfig(): RiskManagerConfig {
    if (!isBrowser) return DEFAULT_RISK_CONFIG;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RISK_CONFIG);
      if (data) {
        return {
          ...DEFAULT_RISK_CONFIG,
          ...JSON.parse(data),
        };
      }
    } catch (e) {
      console.warn('Error reading risk config from browser localStorage:', e);
    }
    return DEFAULT_RISK_CONFIG;
  }

  public static saveRiskConfig(config: RiskManagerConfig): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.RISK_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Error saving risk config to browser localStorage:', e);
    }
  }

  // 3. Execution Mode Persistence
  public static loadExecutionMode(): ExecutionMode {
    if (!isBrowser) return 'MANUAL';
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXECUTION_MODE);
      if (data === 'MANUAL' || data === 'SEMI_AUTONOMOUS' || data === 'FULL_AUTOPILOT') {
        return data;
      }
    } catch (e) {
      console.warn('Error reading execution mode from browser localStorage:', e);
    }
    return 'MANUAL';
  }

  public static saveExecutionMode(mode: ExecutionMode): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.EXECUTION_MODE, mode);
    } catch (e) {
      console.warn('Error saving execution mode to browser localStorage:', e);
    }
  }

  // 4. Consensus & Decision History
  public static saveConsensusResult(result: SwarmConsensusResult): void {
    if (!isBrowser) return;
    try {
      const existing = this.loadConsensusHistory();
      const updated = [result, ...existing.slice(0, 19)]; // Keep latest 20
      localStorage.setItem(STORAGE_KEYS.CONSENSUS_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving consensus to browser localStorage:', e);
    }
  }

  public static loadConsensusHistory(): SwarmConsensusResult[] {
    if (!isBrowser) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONSENSUS_HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading consensus history from browser localStorage:', e);
    }
    return [];
  }

  // 5. Theme Preference (Dark / Light Mode)
  public static loadTheme(): 'dark' | 'light' {
    if (!isBrowser) return 'dark';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.warn('Error reading theme from browser localStorage:', e);
    }
    return 'dark';
  }

  public static saveTheme(theme: 'dark' | 'light'): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.warn('Error saving theme to browser localStorage:', e);
    }
  }

  // 6. Reset All Local Browser Storage
  public static resetAll(): void {
    if (!isBrowser) return;
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Error clearing browser localStorage:', e);
    }
  }
}
