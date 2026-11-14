import { ExecutionMode, Position, SwarmConsensusResult, TradeHistoryItem } from './types';
import { PortfolioState, INITIAL_PORTFOLIO } from './store';
import { DEFAULT_RISK_CONFIG, RiskManagerConfig } from './agents/RiskManager';
import { db, firebaseConfig } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

const STORAGE_KEYS = {
  PORTFOLIO: 'qri_storage_portfolio_v2',
  RISK_CONFIG: 'qri_storage_risk_config_v2',
  EXECUTION_MODE: 'qri_storage_execution_mode_v2',
  NEWS_CACHE: 'qri_storage_news_cache_v2',
  CONSENSUS_HISTORY: 'qri_storage_consensus_history_v2',
};

const LEGACY_STORAGE_KEYS = {
  PORTFOLIO: 'apex_storage_portfolio_v2',
  RISK_CONFIG: 'apex_storage_risk_config_v2',
  EXECUTION_MODE: 'apex_storage_execution_mode_v2',
  NEWS_CACHE: 'apex_storage_news_cache_v2',
  CONSENSUS_HISTORY: 'apex_storage_consensus_history_v2',
};

const isBrowser = typeof window !== 'undefined';

// Utility to strip undefined properties for Firestore compatibility
function cleanForFirestore<T>(data: T): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(cleanForFirestore);
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) {
      cleanObj[key] = cleanForFirestore(val);
    }
  }
  return cleanObj;
}

export interface FirebaseConnectionStatus {
  connected: boolean;
  projectId: string;
  authDomain: string;
  statusText: string;
  lastSyncedAt?: number;
  error?: string;
}

export class BrowserStorageManager {
  private static lastSyncTimestamp: number = Date.now();
  private static isFirestoreAvailable: boolean = true;

  // ==========================================================
  // 1. Portfolio Persistence (Firebase Firestore + Local Cache)
  // ==========================================================
  public static loadPortfolio(): PortfolioState {
    if (!isBrowser) return INITIAL_PORTFOLIO;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO) || localStorage.getItem(LEGACY_STORAGE_KEYS.PORTFOLIO);
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

  public static async loadPortfolioFromCloud(): Promise<PortfolioState | null> {
    if (!db) return null;
    try {
      const docRef = doc(db, 'portfolios', 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as PortfolioState;
        this.savePortfolioToLocal(data);
        return data;
      }
    } catch (e: any) {
      console.warn('Firestore loadPortfolioNotice:', e?.message || e);
      this.isFirestoreAvailable = false;
    }
    return null;
  }

  public static savePortfolio(portfolio: PortfolioState): void {
    // 1. Synchronously save to local cache for 0ms UI latency
    this.savePortfolioToLocal(portfolio);

    // 2. Asynchronously sync to Firebase Firestore
    this.savePortfolioToCloud(portfolio);
  }

  private static savePortfolioToLocal(portfolio: PortfolioState): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
    } catch (e) {
      console.warn('Error saving portfolio to browser localStorage:', e);
    }
  }

  private static async savePortfolioToCloud(portfolio: PortfolioState): Promise<void> {
    if (!db) return;
    try {
      const cleaned = cleanForFirestore({
        ...portfolio,
        updatedAt: Date.now(),
      });
      await setDoc(doc(db, 'portfolios', 'default'), cleaned, { merge: true });
      this.lastSyncTimestamp = Date.now();
      this.isFirestoreAvailable = true;
    } catch (e: any) {
      console.warn('Firestore savePortfolioNotice (falling back to local cache):', e?.message || e);
      this.isFirestoreAvailable = false;
    }
  }

  // Real-time Firestore Portfolio Listener
  public static subscribeToPortfolio(onUpdate: (portfolio: PortfolioState) => void): Unsubscribe | null {
    if (!db || !isBrowser) return null;
    try {
      const docRef = doc(db, 'portfolios', 'default');
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PortfolioState;
          this.savePortfolioToLocal(data);
          onUpdate(data);
        }
      }, (error) => {
        console.warn('Firestore portfolio snapshot listener notice:', error.message);
      });
    } catch (e) {
      console.warn('Failed to attach Firestore snapshot listener:', e);
      return null;
    }
  }

  // ==========================================================
  // 2. Risk Manager Config Persistence (Firebase + Local Cache)
  // ==========================================================
  public static loadRiskConfig(): RiskManagerConfig {
    if (!isBrowser) return DEFAULT_RISK_CONFIG;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RISK_CONFIG) || localStorage.getItem(LEGACY_STORAGE_KEYS.RISK_CONFIG);
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

  public static async loadRiskConfigFromCloud(): Promise<RiskManagerConfig | null> {
    if (!db) return null;
    try {
      const docRef = doc(db, 'riskConfigs', 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as RiskManagerConfig;
        this.saveRiskConfigToLocal(data);
        return data;
      }
    } catch (e: any) {
      console.warn('Firestore loadRiskConfigNotice:', e?.message || e);
    }
    return null;
  }

  public static saveRiskConfig(config: RiskManagerConfig): void {
    this.saveRiskConfigToLocal(config);
    this.saveRiskConfigToCloud(config);
  }

  private static saveRiskConfigToLocal(config: RiskManagerConfig): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.RISK_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Error saving risk config to browser localStorage:', e);
    }
  }

  private static async saveRiskConfigToCloud(config: RiskManagerConfig): Promise<void> {
    if (!db) return;
    try {
      const cleaned = cleanForFirestore({
        ...config,
        updatedAt: Date.now(),
      });
      await setDoc(doc(db, 'riskConfigs', 'default'), cleaned, { merge: true });
      this.lastSyncTimestamp = Date.now();
    } catch (e: any) {
      console.warn('Firestore saveRiskConfigNotice:', e?.message || e);
    }
  }

  // ==========================================================
  // 3. Execution Mode Persistence (Firebase + Local Cache)
  // ==========================================================
  public static loadExecutionMode(): ExecutionMode {
    if (!isBrowser) return 'MANUAL';
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXECUTION_MODE) || localStorage.getItem(LEGACY_STORAGE_KEYS.EXECUTION_MODE);
      if (data === 'MANUAL' || data === 'SEMI_AUTONOMOUS' || data === 'FULL_AUTOPILOT') {
        return data;
      }
    } catch (e) {
      console.warn('Error reading execution mode from browser localStorage:', e);
    }
    return 'MANUAL';
  }

  public static saveExecutionMode(mode: ExecutionMode): void {
    if (isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEYS.EXECUTION_MODE, mode);
      } catch (e) {
        console.warn('Error saving execution mode to browser localStorage:', e);
      }
    }

    if (db) {
      setDoc(doc(db, 'settings', 'executionMode'), { mode, updatedAt: Date.now() }, { merge: true })
        .catch(err => console.warn('Firestore saveExecutionMode notice:', err?.message || err));
    }
  }

  // ==========================================================
  // 4. Consensus & Decision History (Firebase + Local Cache)
  // ==========================================================
  public static saveConsensusResult(result: SwarmConsensusResult): void {
    // 1. Local Cache
    if (isBrowser) {
      try {
        const existing = this.loadConsensusHistory();
        const updated = [result, ...existing.slice(0, 19)]; // Keep latest 20
        localStorage.setItem(STORAGE_KEYS.CONSENSUS_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving consensus to browser localStorage:', e);
      }
    }

    // 2. Firebase Cloud Log
    if (db) {
      const entry = cleanForFirestore({
        pair: result.pair,
        timeframe: result.timeframe,
        direction: result.consensusDirection,
        confidence: result.overallConfidence,
        confluenceGrade: result.confluenceGrade,
        unifiedDecision: result.unifiedDecision,
        currentPrice: result.currentPrice,
        timestamp: Date.now(),
        dateIso: new Date().toISOString(),
      });

      addDoc(collection(db, 'consensus_history'), entry)
        .catch(e => console.warn('Firestore consensus history log notice:', e?.message || e));
    }
  }

  public static loadConsensusHistory(): SwarmConsensusResult[] {
    if (!isBrowser) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONSENSUS_HISTORY) || localStorage.getItem(LEGACY_STORAGE_KEYS.CONSENSUS_HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading consensus history from browser localStorage:', e);
    }
    return [];
  }

  public static async loadConsensusHistoryFromCloud(): Promise<any[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'consensus_history'), orderBy('timestamp', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (e: any) {
      console.warn('Firestore loadConsensusHistoryNotice:', e?.message || e);
      return [];
    }
  }

  // ==========================================================
  // 5. Direct Trade Execution Logger
  // ==========================================================
  public static async logTradeToCloud(trade: TradeHistoryItem): Promise<void> {
    if (!db) return;
    try {
      const cleaned = cleanForFirestore({
        ...trade,
        loggedAt: Date.now(),
      });
      await addDoc(collection(db, 'trades'), cleaned);
    } catch (e: any) {
      console.warn('Firestore logTradeNotice:', e?.message || e);
    }
  }

  // ==========================================================
  // 6. Firebase Connection Status Diagnostic
  // ==========================================================
  public static async getFirebaseStatus(): Promise<FirebaseConnectionStatus> {
    const status: FirebaseConnectionStatus = {
      connected: false,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      statusText: 'Connecting to Firebase Firestore...',
      lastSyncedAt: this.lastSyncTimestamp,
    };

    if (!db) {
      status.statusText = 'Firebase SDK not initialized (Offline Local Cache Mode)';
      return status;
    }

    try {
      // Test read to check Firestore accessibility
      const testDocRef = doc(db, 'portfolios', 'default');
      await getDoc(testDocRef);
      status.connected = true;
      status.statusText = 'Connected to Firebase Firestore Cloud';
      this.isFirestoreAvailable = true;
    } catch (e: any) {
      status.connected = false;
      status.error = e?.message || String(e);
      if (e?.code === 'permission-denied') {
        status.statusText = 'Firebase Connected (Firestore Security Rules need read/write permission)';
      } else {
        status.statusText = 'Local Cache Active (Cloud Sync Resumes When Online)';
      }
    }

    return status;
  }

  // ==========================================================
  // 7. Reset All Local & Cloud Storage
  // ==========================================================
  public static resetAll(): void {
    if (isBrowser) {
      try {
        Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.warn('Error clearing browser localStorage:', e);
      }
    }

    if (db) {
      const resetState = cleanForFirestore({
        ...INITIAL_PORTFOLIO,
        updatedAt: Date.now(),
      });
      setDoc(doc(db, 'portfolios', 'default'), resetState)
        .catch(err => console.warn('Firestore reset notice:', err));
    }
  }
}
