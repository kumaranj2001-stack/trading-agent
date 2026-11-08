import React from 'react';
import Link from 'next/link';
import { Bot, ArrowLeft, Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-terminal-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-terminal-900 border border-terminal-border rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-800/80 mx-auto flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
          <Bot className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            404 // ROUTE NOT RECOGNIZED
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Qri Trader Terminal
          </h1>
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            The requested page or endpoint is not registered within the multi-agent swarm architecture.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/40"
          >
            <Activity className="w-4 h-4" />
            <span>Launch Live Terminal</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
