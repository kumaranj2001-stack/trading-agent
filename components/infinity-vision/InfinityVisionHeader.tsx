'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  SlidersHorizontal, 
  Layers, 
  Users, 
  BookMarked, 
  Bell, 
  Compass,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Menu,
  X
} from 'lucide-react';

export interface InfinityVisionHeaderProps {
  activeTab: string;
  onSelectNavTab: (tab: string) => void;
  onOpenJournal?: () => void;
  onOpenCommandSearch?: () => void;
  userName?: string;
  theme?: 'light' | 'dark';
}

export const InfinityVisionHeader: React.FC<InfinityVisionHeaderProps> = ({
  activeTab = 'technical-analysis',
  onSelectNavTab,
  onOpenJournal,
  onOpenCommandSearch,
  userName = 'kumaran',
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'academy', label: 'Academy' },
    { id: 'technical-analysis', label: 'Technical Analysis' },
    { id: 'trading-tools', label: 'Trading Tools' },
    { id: 'funding', label: 'Funding' },
    { id: 'community', label: 'Community' },
    { id: 'journal', label: 'Journal', action: onOpenJournal },
    { id: 'alert', label: 'Alert' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <header className={`w-full border-b transition-colors select-none ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-800' 
        : 'bg-terminal-950 border-terminal-border text-slate-100'
    }`}>
      <div className="w-full px-3 lg:px-6 h-14 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative flex items-center justify-center">
            {/* Infinity Vision Bull / Horns Stylized Icon */}
            <svg 
              className={`w-7 h-7 ${isLight ? 'text-slate-900' : 'text-cyan-400'}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 6c2-3 8-3 8 3 0-6 6-6 8-3-2 5-6 10-8 13C10 16 6 11 4 6z" />
              <path d="M8 10a4 4 0 0 0 8 0" />
              <circle cx="12" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className={`font-black text-sm lg:text-base tracking-wider uppercase font-sans ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            INFINITY VISION
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 text-xs lg:text-[13px] font-medium shrink-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onSelectNavTab(item.id);
                  }
                }}
                className={`px-2.5 lg:px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? isLight
                      ? 'bg-slate-100 text-slate-950 font-bold shadow-sm'
                      : 'bg-terminal-800 text-white font-bold border border-cyan-500/30'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    : 'text-slate-400 hover:text-white hover:bg-terminal-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Sparkle and User Profile Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick AI Sparkle Pill */}
          <button
            onClick={onOpenCommandSearch}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'bg-terminal-900 border-terminal-border text-cyan-400 hover:bg-terminal-800'
            }`}
            title="Institutional Assistant"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Search Box / Command Palette Pill */}
          <button
            onClick={onOpenCommandSearch}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                : 'bg-terminal-900 border-terminal-border text-slate-400 hover:border-terminal-border/80'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-medium">Search</span>
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
              isLight ? 'bg-slate-200 text-slate-600' : 'bg-terminal-800 text-slate-400'
            }`}>
              Ctrl K
            </kbd>
          </button>

          {/* User Profile Avatar Pill */}
          <div className={`flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              : 'bg-terminal-900 border-terminal-border text-slate-200 hover:bg-terminal-800'
          }`}>
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] uppercase">
              {userName.charAt(0)}
            </div>
            <span className="text-xs truncate max-w-[90px]">{userName}</span>
          </div>

          {/* Mobile Navigation Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-slate-300 dark:border-terminal-border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-terminal-900"
            title="Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-terminal-border p-3 space-y-1 bg-white/95 dark:bg-terminal-950/95 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (item.action) {
                    item.action();
                  } else {
                    onSelectNavTab(item.id);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-terminal-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
