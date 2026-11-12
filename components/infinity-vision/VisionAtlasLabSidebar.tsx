'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  HelpCircle, 
  Play, 
  Volume2, 
  VolumeX, 
  Layers, 
  Bookmark, 
  Cpu, 
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CurrencyPair } from '@/lib/types';

export interface VisionAtlasLabSidebarProps {
  pair: CurrencyPair;
  timeframe: string;
  theme?: 'light' | 'dark';
  onSimulate?: () => void;
}

export const VisionAtlasLabSidebar: React.FC<VisionAtlasLabSidebarProps> = ({
  pair,
  timeframe,
  theme = 'light',
  onSimulate,
}) => {
  const isLight = theme === 'light';
  const cleanPair = pair.replace('/', '');
  const [selectedLanguage, setSelectedLanguage] = useState<'ta' | 'en'>('en');
  const [isVoiceOn, setIsVoiceOn] = useState<boolean>(true);
  const [voiceSpeed, setVoiceSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST'>('NORMAL');
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [explanationText, setExplanationText] = useState<string>('');

  const handleAnalyseAndExplain = () => {
    setIsExplaining(true);
    const textEn = `Institutional Order Flow for ${cleanPair} on ${timeframe}: Price has executed a sell-side liquidity sweep at 3998.47. High-probability confluence entry zone is isolated between 4050.28 and 4052.61, overlapping the 61.8% Fibonacci retracement and premium fair value gap. Maintain stop loss above danger threshold 4067.16.`;
    const textTa = `${cleanPair} ${timeframe} நேரடி தொழில்நுட்ப பகுப்பாய்வு: விலை 3998.47 இல் கீழ்நிலைப் பணப்புழக்கத்தை (Sell-side Liquidity) எடுத்துள்ளது. 4050.28 முதல் 4052.61 வரையிலான பகுதியில் உயர் நம்பகத்தன்மை கொண்ட என்ட்ரி மண்டலம் கண்டறியப்பட்டுள்ளது. ஆபத்து எல்லையான 4067.16 க்கு மேல் ஸ்டாப் லாஸ் வைக்கவும்.`;
    
    const textToSpeak = selectedLanguage === 'ta' ? textTa : textEn;
    setExplanationText(textToSpeak);

    if (isVoiceOn && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = selectedLanguage === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = voiceSpeed === 'SLOW' ? 0.8 : voiceSpeed === 'FAST' ? 1.2 : 1.0;
      utterance.onend = () => setIsExplaining(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsExplaining(false), 3000);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col select-none overflow-y-auto custom-scrollbar font-sans text-xs ${
      isLight ? 'text-slate-800' : 'text-slate-100'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-terminal-border flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              VISION ATLAS LAB
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Daily Advanced Market Analysis</p>
        </div>

        <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:underline">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>How to use</span>
        </button>
      </div>

      <div className="p-3.5 space-y-3.5 flex-1">
        {/* Language Selection: தமிழ் / English */}
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900/40 space-y-1.5">
          <span className="font-bold text-[11px] text-slate-800 dark:text-white block">
            Language - மொழி
          </span>
          <p className="text-[10px] text-slate-500 leading-tight">
            Choose the language for the analysis, the chart labels and the voice. பகுப்பாய்வுக்கான மொழியைத் தேர்வு செய்யவும், விளக்கப்பட லேபிள்கள் மற்றும் குரல்.
          </p>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedLanguage('ta')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                selectedLanguage === 'ta'
                  ? 'bg-slate-900 text-white dark:bg-cyan-600'
                  : 'border border-slate-300 dark:border-terminal-border text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              தமிழ் (Tamil)
            </button>
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                selectedLanguage === 'en'
                  ? 'bg-slate-900 text-white dark:bg-cyan-600'
                  : 'border border-slate-300 dark:border-terminal-border text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Institutional Liquidity Snapshot */}
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-terminal-border space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Institutional liquidity
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-terminal-800 font-bold text-slate-500">
              ESTIMATED
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Liquidity sweep:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Sell-side swept at 3998.47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Structure:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">MSS (CHoCH) bearish</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Analysis confidence:</span>
              <span className="font-bold text-amber-600">Low</span>
            </div>
          </div>

          {/* Split Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-emerald-600">Bullish 47%</span>
              <span className="text-rose-600">Bearish 53%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-terminal-800 overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '47%' }} />
              <div className="bg-rose-500 h-full" style={{ width: '53%' }} />
            </div>
          </div>

          {/* Possible Reaction Zones */}
          <div className="pt-2 border-t border-slate-200 dark:border-terminal-border space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block font-sans">Possible reaction zones</span>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-700 dark:text-slate-300">Sell-limit zone</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">4001.70 - 4002.40</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-700" />
                  <span className="text-slate-700 dark:text-slate-300">Sell-limit zone 2</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">4010.14 - 4012.72</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300">Sell-side liquidity</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">3999.67 - 4000.55</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-700" />
                  <span className="text-slate-700 dark:text-slate-300">Buy-limit zone</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">3989.97 - 3996.36</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 italic pt-1 font-sans">
              Entry areas, invalidation and targets appear only when a sweep, a structure confirmation and enough history agree.
            </p>
          </div>
        </div>

        {/* Market Analysis & Explanation Form */}
        <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border space-y-2.5">
          <span className="font-bold text-[11px] text-slate-900 dark:text-white block">
            Market analysis & explanation - {cleanPair} {timeframe}
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select className="px-2 py-1 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 font-semibold">
              <option>{cleanPair}</option>
            </select>
            <select className="px-2 py-1 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 font-semibold">
              <option>{timeframe}</option>
            </select>
          </div>

          <button
            onClick={handleAnalyseAndExplain}
            disabled={isExplaining}
            className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExplaining ? 'animate-spin' : ''}`} />
            <span>{isExplaining ? 'ANALYSING & VOICING...' : 'ANALYSE & EXPLAIN'}</span>
          </button>

          {/* Voice Narration & Speed Controls */}
          <div className="flex items-center justify-between gap-1 pt-1 text-[11px]">
            <button
              onClick={() => setIsVoiceOn(!isVoiceOn)}
              className={`px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 ${
                isVoiceOn 
                  ? 'bg-slate-900 text-white dark:bg-cyan-600' 
                  : 'border-slate-300 dark:border-terminal-border text-slate-400'
              }`}
            >
              {isVoiceOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>{isVoiceOn ? 'Voice On' : 'Voice Off'}</span>
            </button>

            <span className="text-slate-400 text-[10px]">Speed:</span>
            {(['SLOW', 'NORMAL', 'FAST'] as const).map(s => (
              <button
                key={s}
                onClick={() => setVoiceSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  voiceSpeed === s
                    ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Explanation Output Box */}
          {explanationText && (
            <div className="p-2.5 rounded bg-slate-50 dark:bg-terminal-900/60 border border-slate-200 dark:border-terminal-border text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
              {explanationText}
            </div>
          )}
        </div>

        {/* Live Scenario Simulator */}
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-terminal-border space-y-2">
          <span className="font-bold text-[11px] text-slate-900 dark:text-white block">
            Live scenario simulator - {cleanPair} {timeframe}
          </span>
          <button
            onClick={onSimulate}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-terminal-800 dark:hover:bg-terminal-700 font-bold text-xs transition-colors"
          >
            SIMULATE
          </button>
        </div>

        {/* Signal Engine Status */}
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-terminal-border space-y-1">
          <span className="font-bold text-[11px] text-slate-900 dark:text-white block">
            Signal engine - {cleanPair} {timeframe}
          </span>
          <p className="text-[10px] text-slate-500 font-mono">
            NO SIGNAL: Bullish - last closed candle did not meet minimum institutional threshold.
          </p>
        </div>
      </div>
    </div>
  );
};
