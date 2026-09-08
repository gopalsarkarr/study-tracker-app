import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Sparkles, Trophy, Flame, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CelebrationModal() {
  const { celebration, dismissCelebration } = useStudy();

  if (!celebration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 w-full max-w-md rounded-3xl border border-indigo-500/40 p-8 text-center shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-in zoom-in-95 duration-300">
        
        {/* Glow behind icon */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-28 h-28 bg-indigo-500/25 rounded-full blur-2xl pointer-events-none" />

        {/* Icon */}
        <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-2xl mb-6 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            {celebration.type === 'perfect_day' ? (
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            ) : celebration.type === 'streak' ? (
              <Flame className="w-10 h-10 text-amber-400 animate-pulse" />
            ) : (
              <Sparkles className="w-10 h-10 text-indigo-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-2xl font-black tracking-tight text-white mb-2">
          {celebration.title}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-xs mx-auto">
          {celebration.subtitle}
        </p>

        {/* Dismiss CTA */}
        <button
          onClick={dismissCelebration}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/30 transition-all transform active:scale-98 flex items-center justify-center gap-2"
        >
          <span>Keep The Momentum</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
