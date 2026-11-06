'use client';

import React, { useState } from 'react';
import { AgentDebateMessage } from '@/lib/types';
import { Send, Bot, Shield, BarChart2, Globe, Scale } from 'lucide-react';

interface AgentDebateFeedProps {
  messages: AgentDebateMessage[];
  onSendCustomPrompt?: (prompt: string) => void;
  isDebating?: boolean;
}

export const AgentDebateFeed: React.FC<AgentDebateFeedProps> = ({
  messages,
  onSendCustomPrompt,
  isDebating = false,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isDebating) return;
    if (onSendCustomPrompt) {
      onSendCustomPrompt(inputPrompt.trim());
      setInputPrompt('');
    }
  };

  const getRoleIcon = (role: AgentDebateMessage['role']) => {
    switch (role) {
      case 'technical_analyst':
        return <BarChart2 className="w-4 h-4 text-cyan-400" />;
      case 'fundamental_analyst':
        return <Globe className="w-4 h-4 text-purple-400" />;
      case 'forex_analyst':
        return <Scale className="w-4 h-4 text-amber-400" />;
      case 'risk_manager':
        return <Shield className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-3 sm:p-4 flex flex-col h-[520px] sm:h-[650px] max-h-[82vh] shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-terminal-border/60 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="font-bold text-white text-sm">Autonomous Swarm Debate Room</h3>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
              Cross-Examination: Technical • Fundamental • Forex • Risk Manager
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono bg-terminal-800 text-indigo-300 border border-indigo-500/30">
          3-ROUND PROTOCOL
        </span>
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 sm:pr-2 font-mono scrollbar-thin">
        {messages.map((msg) => {
          const isRisk = msg.role === 'risk_manager';
          return (
            <div
              key={msg.id}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                isRisk 
                  ? 'bg-terminal-950/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10' 
                  : 'bg-terminal-950/60 border-terminal-border hover:border-slate-600'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${msg.avatarColor}`}>
                    {getRoleIcon(msg.role)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white block truncate">{msg.agentName}</span>
                    <span className="text-[10px] text-slate-400 capitalize truncate block">
                      {msg.role.replace('_', ' ')} • Round {msg.round}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    msg.sentiment === 'BULLISH'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : msg.sentiment === 'BEARISH'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : msg.sentiment === 'CAUTION'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                  }`}>
                    {msg.sentiment}
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>
              </div>

              <p className="text-slate-200 text-xs font-sans leading-relaxed pl-1">
                {msg.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-terminal-border/60 flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Cross-examine the swarm or inject macro stress scenario..."
          maxLength={300}
          className="flex-1 bg-terminal-950 border border-terminal-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isDebating}
          className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg flex items-center gap-1.5 font-mono text-xs font-bold transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DEBATE</span>
        </button>
      </form>
    </div>
  );
};
