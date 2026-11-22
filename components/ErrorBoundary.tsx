'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🛡️ [QRI ErrorBoundary] Caught client-side exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[300px] p-6 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-200 font-mono text-xs flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="p-3 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <div className="text-center space-y-1 max-w-lg">
            <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider">
              {this.props.fallbackTitle || 'Component Recovered from Client Exception'}
            </h3>
            <p className="text-[11px] text-slate-400">
              An unexpected client-side rendering error was isolated to prevent an application-wide crash.
            </p>
            {this.state.error && (
              <div className="mt-2 p-2.5 rounded bg-black/60 border border-rose-500/30 text-rose-300 text-[10px] text-left overflow-x-auto max-h-32">
                <code>{this.state.error.message || String(this.state.error)}</code>
              </div>
            )}
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 transition-colors shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset & Reconnect Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
