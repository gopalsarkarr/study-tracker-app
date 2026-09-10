import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getLastNDays, formatShortDate } from '../utils/dateUtils';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceDot
} from 'recharts';
import { Flame, Award, Calendar, BarChart3 } from 'lucide-react';

// Timeframe Filter Presets
const TIMEFRAMES = [
  { id: 'weekly', label: 'Weekly', subLabel: '7D', days: 7, interval: 0 },
  { id: 'monthly', label: 'Monthly', subLabel: '30D', days: 30, interval: 2 },
  { id: '50days', label: 'Last 50 Days', subLabel: '50D', days: 50, interval: 4 },
  { id: 'total', label: 'Total (100 Days)', subLabel: '100D', days: 100, interval: 9 },
];

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-slate-900/95 light:bg-white p-4 rounded-2xl border border-slate-700/80 light:border-slate-300 shadow-2xl backdrop-blur-xl text-white light:text-slate-900 min-w-[220px]">
        <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-200 pb-2 mb-2">
          <span className="text-xs font-mono font-bold text-indigo-400">
            Day {data.dayIndex} • {data.displayDate}
          </span>
          {data.isToday && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Today
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Progress Score:</span>
            <span className="font-mono font-bold text-indigo-400 text-sm">{data.score}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Daily Completion:</span>
            <span className="font-mono font-bold text-emerald-400">{data.completionPercentage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Points Earned:</span>
            <span className="font-mono font-bold text-amber-400">+{data.dailyPoints} pts</span>
          </div>
        </div>

        {/* Completed subjects list */}
        {data.completedSkills && data.completedSkills.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 light:border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block mb-1">
              Completed Subjects:
            </span>
            <div className="flex flex-wrap gap-1">
              {data.completedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Milestone indicator */}
        {data.milestone && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 light:border-slate-200 flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <Award className="w-3.5 h-3.5" />
            <span>{data.milestone}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function ProgressGraph() {
  const {
    todayISO,
    dailyHistory,
    currentCreditScore,
    currentStreak,
    todayCompletionPct,
    theme,
  } = useStudy();

  // Active timeframe state: default 'weekly' (7 days)
  const [timeframe, setTimeframe] = useState('weekly');

  const currentTfConfig = useMemo(() => {
    return TIMEFRAMES.find(t => t.id === timeframe) || TIMEFRAMES[3];
  }, [timeframe]);

  // Generate chart data based on selected timeframe
  const { chartData, totalActiveDays, isFinalMilestoneMet } = useMemo(() => {
    const dates = getLastNDays(new Date(), currentTfConfig.days);
    let activeDaysCount = 0;

    const data = dates.map((iso, idx) => {
      const dayIndex = idx + 1;
      const rec = dailyHistory[iso] || {
        completionPercentage: 0,
        dailyPoints: 0,
        creditScoreAfterCompletion: 500,
        completedSkills: [],
      };

      const isToday = iso === todayISO;
      const score = isToday
        ? (rec.creditScoreAfterCompletion || currentCreditScore || 500)
        : (rec.creditScoreAfterCompletion || rec.cumulativeProgressScore || 500);

      const completionPercentage = isToday
        ? (typeof rec.completionPercentage === 'number' ? rec.completionPercentage : todayCompletionPct)
        : (rec.completionPercentage || 0);

      if (completionPercentage >= 30) {
        activeDaysCount++;
      }

      // Milestones depending on timeframe
      let milestone = null;
      if (currentTfConfig.days === 100) {
        if (dayIndex === 7) milestone = 'First Week Complete (Day 7)';
        if (dayIndex === 30) milestone = 'Habit Solidified (Day 30)';
        if (dayIndex === 50) milestone = 'Half-Century Reached (Day 50)';
        if (dayIndex === 100) milestone = '100-Day Mastery Complete 🎉';
      } else if (currentTfConfig.days === 50) {
        if (dayIndex === 10) milestone = 'First 10 Days (Day 10)';
        if (dayIndex === 25) milestone = 'Midway Point (Day 25)';
        if (dayIndex === 40) milestone = 'High Momentum (Day 40)';
        if (dayIndex === 50) milestone = '50-Day Century Half 🎉';
      } else if (currentTfConfig.days === 30) {
        if (dayIndex === 7) milestone = 'First Week Complete (Day 7)';
        if (dayIndex === 15) milestone = 'Halfway There (Day 15)';
        if (dayIndex === 21) milestone = 'Three Week Streak (Day 21)';
        if (dayIndex === 30) milestone = '30-Day Challenge Complete 🎉';
      } else {
        // Weekly (7 days)
        if (dayIndex === 1) milestone = 'Week Kickoff (Day 1)';
        if (dayIndex === 3) milestone = 'Mid-Week Rhythm (Day 3)';
        if (dayIndex === 5) milestone = 'Discipline Locked (Day 5)';
        if (dayIndex === 7) milestone = '7-Day Champion 🎉';
      }

      return {
        dayIndex,
        date: iso,
        displayDate: formatShortDate(iso),
        score,
        completionPercentage,
        dailyPoints: rec.dailyPoints || 0,
        completedSkills: rec.completedSkills || [],
        isToday,
        milestone,
      };
    });

    const lastDay = data[data.length - 1];
    const isDone = lastDay && lastDay.completionPercentage >= 70;

    return { chartData: data, totalActiveDays: activeDaysCount, isFinalMilestoneMet: isDone };
  }, [dailyHistory, todayISO, currentTfConfig]);

  // Milestone cards based on timeframe
  const milestoneCards = useMemo(() => {
    if (currentTfConfig.days === 100) {
      return [
        { day: 7, label: 'Day 7: First Week', status: 'Complete' },
        { day: 30, label: 'Day 30: Habit Formed', status: 'Solidified' },
        { day: 50, label: 'Day 50: Half-Century', status: 'Reached' },
        { day: 100, label: 'Day 100: Century Master', status: isFinalMilestoneMet ? 'Mastered 🏆' : 'In Progress 🚀' },
      ];
    }
    if (currentTfConfig.days === 50) {
      return [
        { day: 10, label: 'Day 10: Foundation', status: 'Solid' },
        { day: 25, label: 'Day 25: Midpoint', status: 'Reached' },
        { day: 40, label: 'Day 40: High Output', status: 'Locked' },
        { day: 50, label: 'Day 50: Peak Goal', status: isFinalMilestoneMet ? 'Achieved 🏆' : 'In Progress 🚀' },
      ];
    }
    if (currentTfConfig.days === 30) {
      return [
        { day: 7, label: 'Day 7: First Week', status: 'Complete' },
        { day: 15, label: 'Day 15: Halfway', status: 'Reached' },
        { day: 21, label: 'Day 21: Habit Locked', status: 'Solidified' },
        { day: 30, label: 'Day 30: Challenge', status: isFinalMilestoneMet ? 'Mastered 🏆' : 'In Progress 🚀' },
      ];
    }
    return [
      { day: 1, label: 'Day 1: Kickoff', status: 'Done' },
      { day: 3, label: 'Day 3: Momentum', status: 'Built' },
      { day: 5, label: 'Day 5: Consistency', status: 'Strong' },
      { day: 7, label: 'Day 7: Week Finisher', status: isFinalMilestoneMet ? 'Victory 🏆' : 'In Progress 🚀' },
    ];
  }, [currentTfConfig.days, isFinalMilestoneMet]);

  const isDark = theme === 'dark';

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-3xl p-6 sm:p-8 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl mb-10 transition-all">
      
      {/* Top Header Row with Title, Timeframe Switcher & Summary Statistics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-6 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
        
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white light:text-slate-900">
              100-Day Study Progress Graph
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              {currentTfConfig.label} ({currentTfConfig.subLabel})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Tracking your consistency, cumulative discipline, and cognitive compound interest.
          </p>

          {/* Timeframe Selector Pill Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
            <span className="text-xs font-semibold text-slate-400 light:text-slate-600 mr-1 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Range:</span>
            </span>
            {TIMEFRAMES.map(tf => {
              const isActive = tf.id === timeframe;
              return (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                      : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 text-slate-400 hover:text-white light:hover:text-slate-900 border border-slate-800 light:border-slate-300'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          
          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3 rounded-2xl border border-slate-800/80 light:border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Progress Score</div>
            <div className="text-lg font-bold font-mono text-indigo-400">
              {currentCreditScore}
            </div>
          </div>

          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3 rounded-2xl border border-slate-800/80 light:border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Current Streak</div>
            <div className="text-lg font-bold font-mono text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400/20" />
              <span>{currentStreak}d</span>
            </div>
          </div>

          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3 rounded-2xl border border-slate-800/80 light:border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Days Active</div>
            <div className="text-lg font-bold font-mono text-slate-200 light:text-slate-800">
              {totalActiveDays} / {currentTfConfig.days}
            </div>
          </div>

          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3 rounded-2xl border border-slate-800/80 light:border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Today's %</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {todayCompletionPct}%
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Milestone Badges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {milestoneCards.map(m => (
          <div
            key={m.day}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 text-xs"
          >
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-300 light:text-slate-700 truncate">{m.label}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold shrink-0 ml-1">{m.status}</span>
          </div>
        ))}
      </div>

      {/* Recharts Curved Area Graph */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="progressAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#334155' : '#e2e8f0'}
              opacity={0.4}
              vertical={false}
            />

            <XAxis
              dataKey="dayIndex"
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickFormatter={val => `D${val}`}
              interval={currentTfConfig.interval}
            />

            <YAxis
              domain={[400, 1000]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Area & Smooth Curved Line */}
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={3.5}
              fillOpacity={1}
              fill="url(#progressAreaGradient)"
              activeDot={{ r: 6, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
            />

            {/* Today Reference Dot */}
            {chartData.find(d => d.isToday) && (
              <ReferenceDot
                x={chartData.find(d => d.isToday).dayIndex}
                y={chartData.find(d => d.isToday).score}
                r={7}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 light:text-slate-600 mt-3 pt-3 border-t border-slate-800/80 light:border-slate-200 font-mono">
        <span>← Day 1: Foundation</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
          Highlighted Dot = Today
        </span>
        <span>Day {currentTfConfig.days}: Compounded Mastery →</span>
      </div>

    </div>
  );
}
