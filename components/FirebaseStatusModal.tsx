'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Server, 
  ShieldCheck, 
  X,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft
} from 'lucide-react';
import { BrowserStorageManager, FirebaseConnectionStatus } from '@/lib/browserStorage';
import { firebaseConfig } from '@/lib/firebase';

interface FirebaseStatusModalProps {
  isOpen?: boolean;
  onClose: () => void;
  isFullPage?: boolean;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({
  isOpen = true,
  onClose,
  isFullPage = false,
}) => {
  const [status, setStatus] = useState<FirebaseConnectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [copiedRules, setCopiedRules] = useState<boolean>(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await BrowserStorageManager.getFirebaseStatus();
      setStatus(res);
    } catch (e: any) {
      setStatus({
        connected: false,
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        statusText: 'Diagnostic check failed',
        error: e?.message || String(e),
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const recommendedRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Allows read/write for autonomous trading agent backend
      allow read, write: if true;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(recommendedRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  if (!isOpen && !isFullPage) return null;

  const content = (
    <div 
      className={`w-full ${isFullPage ? 'shadow-xl' : 'max-w-2xl max-h-[90vh] shadow-2xl'} bg-terminal-950 border border-terminal-border rounded-2xl overflow-hidden flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-terminal-border bg-gradient-to-r from-terminal-900 to-amber-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Cloud className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold text-white flex items-center gap-2">
              09 // FIREBASE FIRESTORE REALTIME SYNC & DIAGNOSTIC
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Cloud Live
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Project: <span className="text-amber-300 font-bold">{firebaseConfig.projectId}</span> • Real-Time Firestore Synchronization
            </p>
          </div>
        </div>
        {isFullPage ? (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs transition-colors flex items-center gap-1.5 font-semibold"
            title="Return to Terminal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>RETURN TO TERMINAL</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-terminal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 font-mono text-xs">
          {/* Live Status Card */}
          <div className="p-4 rounded-xl border border-terminal-border bg-terminal-900/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {status?.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <div className="text-sm font-bold text-white">
                    {status?.connected ? 'Cloud Database Connected' : 'Local Cache & Cloud Sync Active'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {status?.statusText || 'Verifying Firestore socket handshake...'}
                  </div>
                </div>
              </div>
              <button
                onClick={checkStatus}
                disabled={isChecking}
                className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-200 border border-terminal-border flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Error detail if any */}
            {status?.error && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                <div className="font-bold mb-1">Notice:</div>
                <div className="font-mono break-all">{status.error}</div>
              </div>
            )}
          </div>

          {/* Active Collections Being Synchronized */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Active Firestore Collections
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg border border-terminal-border bg-terminal-900/60">
                <div className="font-bold text-cyan-300 text-xs">/portfolios/default</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Real-time equity, balance, active positions, margin, and P&L sync.
                </div>
              </div>

              <div className="p-3 rounded-lg border border-terminal-border bg-terminal-900/60">
                <div className="font-bold text-emerald-300 text-xs">/trades</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Full execution log with symbol, lots, entry, exit, and strategy verdict.
                </div>
              </div>

              <div className="p-3 rounded-lg border border-terminal-border bg-terminal-900/60">
                <div className="font-bold text-purple-300 text-xs">/consensus_history</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  5-Agent Swarm unified decisions, confluence grades, and driving pillars.
                </div>
              </div>

              <div className="p-3 rounded-lg border border-terminal-border bg-terminal-900/60">
                <div className="font-bold text-amber-300 text-xs">/riskConfigs & /settings</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Max risk %, drawdown thresholds, leverage, and Autopilot execution mode.
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Parameters */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              Connected SDK Configuration
            </h3>
            <div className="p-3 rounded-lg border border-terminal-border bg-terminal-900/60 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Project ID:</span>
                <span className="text-white font-mono">{firebaseConfig.projectId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auth Domain:</span>
                <span className="text-white font-mono">{firebaseConfig.authDomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Storage Bucket:</span>
                <span className="text-white font-mono">{firebaseConfig.storageBucket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Messaging Sender ID:</span>
                <span className="text-white font-mono">{firebaseConfig.messagingSenderId}</span>
              </div>
            </div>
          </div>

          {/* Firestore Security Rules Helper */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Firestore Security Rules (Optional)
              </h3>
              <button
                onClick={copyRules}
                className="px-2 py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 flex items-center gap-1 text-[11px] transition-colors"
              >
                {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRules ? 'Copied' : 'Copy Rules'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              If your Firebase Console displays a <code>permission-denied</code> error, paste these rules into your 
              <strong> Firebase Console &gt; Firestore Database &gt; Rules</strong> tab and click <strong>Publish</strong>:
            </p>
            <pre className="p-3 rounded-lg bg-terminal-900 border border-terminal-border text-cyan-300 font-mono text-[11px] overflow-x-auto">
              {recommendedRules}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-terminal-border bg-terminal-900/60 flex items-center justify-between">
          <a
            href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors"
          >
            <span>Open Firebase Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold font-mono text-xs transition-colors shadow-lg"
          >
            {isFullPage ? 'Return to Terminal' : 'Close'}
          </button>
        </div>
      </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {content}
    </div>
  );
};
