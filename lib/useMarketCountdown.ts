import { useState, useEffect, useRef } from 'react';
import { MarketSessionInfo } from './types';

export interface UseMarketCountdownOptions {
  sessionInfo: MarketSessionInfo | null;
  onMarketResume?: () => void;
  enabled?: boolean;
}

export interface UseMarketCountdownResult {
  remainingSeconds: number;
  formattedCountdown: string;
  isResuming: boolean;
  hasResumed: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  targetOpenDate: Date | null;
  openDayName: string;
  openUtcTime: string;
}

/**
 * ⏱️ useMarketCountdown: Real-time dynamic countdown hook for market session transitions
 *
 * Actively decrements remaining seconds every 1,000ms using wall-clock time calculation
 * (preventing timer drift when backgrounded or throttled), dynamically formats countdown text,
 * and automatically triggers `onMarketResume` when zero is reached so the platform smoothly
 * transitions into active trading without manual page reloads.
 */
export function useMarketCountdown({
  sessionInfo,
  onMarketResume,
  enabled = true,
}: UseMarketCountdownOptions): UseMarketCountdownResult {
  const targetDateStr = sessionInfo?.nextOpenDate;
  const isFrozen = sessionInfo?.isFrozen ?? false;

  // Compute initial remaining seconds
  const computeSecondsLeft = (): number => {
    if (!isFrozen || !targetDateStr) return 0;
    const targetMs = new Date(targetDateStr).getTime();
    if (isNaN(targetMs)) return 0;
    return Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(computeSecondsLeft);
  const [isResuming, setIsResuming] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const resumeFiredRef = useRef(false);

  // Parse target Date
  const targetOpenDate = targetDateStr ? new Date(targetDateStr) : null;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const openDayName = targetOpenDate && !isNaN(targetOpenDate.getTime()) 
    ? dayNames[targetOpenDate.getUTCDay()] 
    : 'Sun';
  const openUtcTime = targetOpenDate && !isNaN(targetOpenDate.getTime())
    ? `${String(targetOpenDate.getUTCHours()).padStart(2, '0')}:${String(targetOpenDate.getUTCMinutes()).padStart(2, '0')} UTC`
    : '23:00 UTC';

  // Synchronize immediately if sessionInfo or nextOpenDate changes
  useEffect(() => {
    if (!isFrozen || !targetDateStr) {
      setRemainingSeconds(0);
      setIsResuming(false);
      setHasResumed(false);
      resumeFiredRef.current = false;
      return;
    }

    const secs = computeSecondsLeft();
    setRemainingSeconds(secs);

    if (secs > 0) {
      setIsResuming(false);
      setHasResumed(false);
      resumeFiredRef.current = false;
    }
  }, [targetDateStr, isFrozen, sessionInfo?.pair]);

  // Active 1,000ms real-time interval
  useEffect(() => {
    if (!enabled || !isFrozen || !targetDateStr) {
      return;
    }

    const targetMs = new Date(targetDateStr).getTime();
    if (isNaN(targetMs)) return;

    // Check if already expired upon activation
    const currentSecs = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
    if (currentSecs <= 0 && !resumeFiredRef.current) {
      resumeFiredRef.current = true;
      setIsResuming(true);
      setHasResumed(true);
      if (onMarketResume) {
        onMarketResume();
      }
      return;
    }

    const intervalId = setInterval(() => {
      const nowMs = Date.now();
      const secs = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
      setRemainingSeconds(secs);

      if (secs <= 0) {
        clearInterval(intervalId);
        if (!resumeFiredRef.current) {
          resumeFiredRef.current = true;
          setIsResuming(true);
          setHasResumed(true);
          if (onMarketResume) {
            onMarketResume();
          }
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [enabled, isFrozen, targetDateStr, onMarketResume]);

  // Breakdown into days, hours, minutes, seconds
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  // Format string dynamic representation (e.g. "Sun 23:00 UTC (3h 33m 15s)")
  let formattedCountdown = 'Trading Active';

  if (isResuming || hasResumed || remainingSeconds <= 0) {
    formattedCountdown = 'Market Resumed • Live Streaming';
  } else if (isFrozen && targetOpenDate) {
    let durationStr = '';
    if (days > 0) {
      durationStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      durationStr = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      durationStr = `${minutes}m ${seconds}s`;
    } else {
      durationStr = `${seconds}s`;
    }
    formattedCountdown = `${openDayName} ${openUtcTime} (${durationStr})`;
  }

  return {
    remainingSeconds,
    formattedCountdown,
    isResuming,
    hasResumed,
    days,
    hours,
    minutes,
    seconds,
    targetOpenDate,
    openDayName,
    openUtcTime,
  };
}
