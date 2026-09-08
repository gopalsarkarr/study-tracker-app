import React, { useState, useEffect, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getScoreTier } from '../utils/scoringEngine';
import { Flame, TrendingUp, TrendingDown, Target, CheckCircle } from 'lucide-react';

export default function Speedometer() {
  const {
    currentCreditScore,
    scoreDeltaToday,
    todayCompletionPct,
    currentStreak,
    todayCompletedCount,
    todayTotalCount,
  } = useStudy();

  // Animated numerical score counter for the center display
  const [displayScore, setDisplayScore] = useState(currentCreditScore);

  useEffect(() => {
    let start = displayScore;
    const end = currentCreditScore;
    if (start === end) return;

    const duration = 1000; // 1s smooth counting
    const startTime = performance.now();

    const animateNumber = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setDisplayScore(end);
      }
    };

    const animId = requestAnimationFrame(animateNumber);
    return () => cancelAnimationFrame(animId);
  }, [currentCreditScore]);

  // Current tier
  const tier = useMemo(() => getScoreTier(currentCreditScore), [currentCreditScore]);

  // Needle angle calculation:
  // Sweep is 270 degrees total: from -135deg (at 0) to +135deg (at 1000).
  // 500 is exactly at 0deg (pointing straight up).
  const clampedScore = Math.min(1000, Math.max(0, currentCreditScore));
  const needleAngle = -135 + (clampedScore / 1000) * 270;

  // Generate tick marks (major every 100, labeled every 200; minor every 20)
  const ticks = useMemo(() => {
    const list = [];
    const totalTicks = 50; // Every 20 points
    for (let i = 0; i <= totalTicks; i++) {
      const scoreVal = i * 20;
      const angle = -135 + (scoreVal / 1000) * 270;
      const isMajor = scoreVal % 200 === 0;
      const isSemiMajor = scoreVal % 100 === 0 && !isMajor;
      const isRedZone = scoreVal >= 850;

      list.push({
        scoreVal,
        angle,
        isMajor,
        isSemiMajor,
        isRedZone,
      });
    }
    return list;
  }, []);

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-3xl p-4 sm:p-5 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-between transition-all">
      
      {/* Header title */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 light:text-slate-700 font-mono">
            Study Credit Score Meter
          </h2>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800/80 light:bg-slate-100 text-slate-400 light:text-slate-600 border border-slate-700/60 light:border-slate-200">
          Scale: 0 — 1000
        </span>
      </div>

      {/* Speedometer Instrument Cluster (Analog Motorcycle / Bullet Style) */}
      <div className="relative w-full max-w-[240px] sm:max-w-[260px] aspect-square flex items-center justify-center my-1">
        
        {/* Outer Heavy Metallic Bezel with Brushed Chrome Rim */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-slate-700 via-slate-400 to-slate-800 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Inner Dark Rim */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-900 via-slate-950 to-black p-2 border border-slate-600/40">
            {/* Speedometer Face */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-950 to-slate-900 relative flex items-center justify-center overflow-hidden border border-slate-800">
              
              {/* Radial subtle dial texture & glass sheen */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.12),transparent_70%)]" />
              <div className="absolute top-0 left-1/4 right-1/4 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />

              {/* Speedometer SVG Dials, Ticks & Color Arcs */}
              <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 320 320">
                <defs>
                  <linearGradient id="scoreArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="30%" stopColor="#f59e0b" />
                    <stop offset="70%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Outer colored gauge track arc */}
                <circle
                  cx="160"
                  cy="160"
                  r="130"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-800/80"
                  strokeWidth="6"
                  strokeDasharray="612" /* 2 * PI * 130 * 270/360 = ~612 */
                  strokeDashoffset="153"
                  strokeLinecap="round"
                  transform="rotate(135 160 160)"
                />

                {/* Glowing performance arc for active zone */}
                <circle
                  cx="160"
                  cy="160"
                  r="130"
                  fill="none"
                  stroke="url(#scoreArcGrad)"
                  strokeWidth="7"
                  strokeDasharray="612"
                  strokeDashoffset={612 - (clampedScore / 1000) * 612}
                  strokeLinecap="round"
                  transform="rotate(135 160 160)"
                  className="transition-all duration-1000 ease-out opacity-85"
                />

                {/* Major and Minor Ticks around the 270-degree arc */}
                {ticks.map((t, i) => {
                  const rad = ((t.angle - 90) * Math.PI) / 180;
                  const cos = Math.cos(rad);
                  const sin = Math.sin(rad);

                  const outerR = 124;
                  const innerR = t.isMajor ? 104 : t.isSemiMajor ? 112 : 116;

                  const x1 = 160 + outerR * cos;
                  const y1 = 160 + outerR * sin;
                  const x2 = 160 + innerR * cos;
                  const y2 = 160 + innerR * sin;

                  const textR = 90;
                  const tx = 160 + textR * cos;
                  const ty = 160 + textR * sin + 4;

                  return (
                    <g key={i}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={t.isRedZone ? '#f43f5e' : t.isMajor ? '#f1f5f9' : '#64748b'}
                        strokeWidth={t.isMajor ? 2.8 : t.isSemiMajor ? 1.8 : 1.0}
                        strokeLinecap="round"
                      />
                      {t.isMajor && (
                        <text
                          x={tx}
                          y={ty}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="JetBrains Mono, monospace"
                          fill={t.isRedZone ? '#fb7185' : '#cbd5e1'}
                        >
                          {t.scoreVal}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Realistic Analog Speedometer Needle */}
              <div
                className="absolute w-full h-full pointer-events-none flex items-center justify-center transition-all duration-1000 ease-out"
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                  transformOrigin: '50% 50%',
                  willChange: 'transform',
                }}
              >
                {/* Needle blade pointing upwards from center */}
                <div className="relative w-2 h-[76px] -top-[38px] flex flex-col items-center">
                  {/* Needle tip */}
                  <div className="w-0.5 h-4 bg-rose-400 rounded-t-full shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  {/* Needle tapering stem */}
                  <div className="w-1.5 h-13 bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 rounded-sm shadow-sm" />
                  {/* Needle base counter-weight */}
                  <div className="w-2.5 h-3 bg-slate-800 rounded-b-md -mt-0.5" />
                </div>
              </div>

              {/* Center Metal Hub / Boss Cap with Odometer Reading */}
              <div className="absolute w-28 h-28 sm:w-30 sm:h-30 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-black border-2 sm:border-3 border-slate-700 shadow-xl flex flex-col items-center justify-center text-center p-1.5 z-20">
                
                {/* Metallic Hub Ring detail */}
                <div className="absolute inset-1 rounded-full border border-slate-600/40 pointer-events-none" />

                {/* Subtitle */}
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
                  STUDY SCORE
                </span>

                {/* Animated Score Number */}
                <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-white drop-shadow my-0.5">
                  {displayScore}
                </div>

                {/* Score Tier Badge */}
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${tier.badgeClass} shadow-sm max-w-[110px] truncate`}>
                  {tier.label}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Daily Credit Feedback Row */}
      <div className="w-full mt-3 pt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        
        {/* Today's Progress */}
        <div className="bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-50 p-2 rounded-xl border border-slate-800/80 light:border-slate-200">
          <div className="text-[10px] text-slate-400 light:text-slate-500 font-medium">Today's Progress</div>
          <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 light:text-emerald-600">
            {todayCompletionPct}%
          </div>
        </div>

        {/* Current Study Streak */}
        <div className="bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-50 p-2 rounded-xl border border-slate-800/80 light:border-slate-200">
          <div className="text-[10px] text-slate-400 light:text-slate-500 font-medium">Study Streak</div>
          <div className="text-sm sm:text-base font-bold font-mono text-amber-400 flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
            <span>{currentStreak} Days</span>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-50 p-2 rounded-xl border border-slate-800/80 light:border-slate-200">
          <div className="text-[10px] text-slate-400 light:text-slate-500 font-medium">Tasks Completed</div>
          <div className="text-sm sm:text-base font-bold font-mono text-slate-200 light:text-slate-800">
            {todayCompletedCount} / {todayTotalCount}
          </div>
        </div>

        {/* Score Change Today */}
        <div className="bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-50 p-2 rounded-xl border border-slate-800/80 light:border-slate-200">
          <div className="text-[10px] text-slate-400 light:text-slate-500 font-medium">Score Delta Today</div>
          <div className={`text-sm sm:text-base font-bold font-mono flex items-center justify-center gap-1 ${
            scoreDeltaToday >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {scoreDeltaToday >= 0 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{scoreDeltaToday}</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{scoreDeltaToday}</span>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
