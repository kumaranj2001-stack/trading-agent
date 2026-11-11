import { LiveMarketFeedManager, WebSocketMarketTelemetry } from './liveMarketFeed';
import { Position } from './types';

export interface FailSafeStatus {
  isFailSafeArmed: boolean;
  isConnectionLost: boolean;
  disconnectDurationMs: number;
  lastHeartbeatTimestamp: number;
  emergencyActionTaken: boolean;
  reason?: string;
}

export type FailSafeListener = (status: FailSafeStatus) => void;

/**
 * WebSocket Connection Drop Fail-Safe Manager
 * 
 * Continuously monitors the live market feed WebSocket connection.
 * If the connection drops or heartbeat is lost for more than 5000ms,
 * it immediately triggers emergency fail-safe protection to prevent runaway losses
 * during unmonitored disconnects in semi-autonomous and autopilot modes.
 */
export class WebSocketFailSafeManager {
  private static instance: WebSocketFailSafeManager;

  private status: FailSafeStatus = {
    isFailSafeArmed: true,
    isConnectionLost: false,
    disconnectDurationMs: 0,
    lastHeartbeatTimestamp: Date.now(),
    emergencyActionTaken: false,
  };

  private listeners: Set<FailSafeListener> = new Set();
  private disconnectTimer: NodeJS.Timeout | null = null;
  private readonly maxAllowedDisconnectMs = 5000; // 5 seconds threshold

  private constructor() {
    this.initMonitoring();
  }

  public static getInstance(): WebSocketFailSafeManager {
    if (!WebSocketFailSafeManager.instance) {
      WebSocketFailSafeManager.instance = new WebSocketFailSafeManager();
    }
    return WebSocketFailSafeManager.instance;
  }

  private initMonitoring(): void {
    if (typeof window === 'undefined') return;

    LiveMarketFeedManager.subscribeWebSocketTelemetry((telemetry: WebSocketMarketTelemetry) => {
      const now = Date.now();
      if (telemetry.isConnected) {
        this.status.isConnectionLost = false;
        this.status.disconnectDurationMs = 0;
        this.status.lastHeartbeatTimestamp = now;
        this.status.emergencyActionTaken = false;
        this.notify();
      } else {
        if (!this.status.isConnectionLost) {
          this.status.isConnectionLost = true;
          this.status.disconnectDurationMs = now - this.status.lastHeartbeatTimestamp;
          this.notify();
        }
      }
    });

    // Heartbeat verification interval every 1 second
    setInterval(() => {
      const now = Date.now();
      const telemetry = LiveMarketFeedManager.getWebSocketTelemetry();
      const timeSinceLastTick = now - (telemetry.lastTickTimestamp || now);

      if (!telemetry.isConnected || timeSinceLastTick > this.maxAllowedDisconnectMs) {
        const duration = Math.max(timeSinceLastTick, now - this.status.lastHeartbeatTimestamp);
        this.status.isConnectionLost = true;
        this.status.disconnectDurationMs = duration;

        if (duration >= this.maxAllowedDisconnectMs && !this.status.emergencyActionTaken) {
          this.status.emergencyActionTaken = true;
          this.status.reason = `WEBSOCKET DISCONNECT CRITICAL: Stream lost for ${Math.round(duration / 1000)}s. Emergency position protection protocol activated.`;
          this.notify();
        }
      }
    }, 1000);
  }

  public subscribe(listener: FailSafeListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.status });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const s = { ...this.status };
    this.listeners.forEach(fn => fn(s));
  }

  public getStatus(): FailSafeStatus {
    return { ...this.status };
  }

  /**
   * Check if fail-safe requires severing open positions
   */
  public shouldSeverPositions(): boolean {
    return this.status.isFailSafeArmed && this.status.isConnectionLost && this.status.disconnectDurationMs >= this.maxAllowedDisconnectMs;
  }

  public resetFailSafe(): void {
    this.status.emergencyActionTaken = false;
    this.status.isConnectionLost = false;
    this.status.disconnectDurationMs = 0;
    this.status.lastHeartbeatTimestamp = Date.now();
    this.notify();
  }
}

export const webSocketFailSafeManager = WebSocketFailSafeManager.getInstance();
