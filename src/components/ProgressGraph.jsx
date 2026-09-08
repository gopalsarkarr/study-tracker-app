import React, { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getLast30Days, formatShortDate } from '../utils/dateUtils';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Flame, Calendar, Award, Sparkles, CheckCircle2 } from 'lucide-react';

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }) => {
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

  // Generate 30 days data
  const { chartData, totalActiveDays, isDay30Completed } = useMemo(() => {
    const dates = getLast30Days(new Date());
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
      const score = rec.creditScoreAfterCompletion || rec.cumulativeProgressScore || 500;

      if (rec.completionPercentage >= 30) {
        activeDaysCount++;
      }

      // 30-Day Milestones
      let milestone = null;
      if (dayIndex === 7) milestone = 'First Week Complete';
      if (dayIndex === 15) milestone = 'Halfway There (Day 15)';
      if (dayIndex === 21) milestone = 'Three Week Streak (Day 21)';
      if (dayIndex === 30) milestone = '30-Day Challenge Complete 🎉';

      return {
        dayIndex,
        date: iso,
        displayDate: formatShortDate(iso),
        score,
        completionPercentage: rec.completionPercentage || 0,
        dailyPoints: rec.dailyPoints || 0,
        completedSkills: rec.completedSkills || [],
        isToday,
        milestone,
      };
    });

    const day30 = data[data.length - 1];
    const is30Done = day30 && day30.completionPercentage >= 70;

    return { chartData: data, totalActiveDays: activeDaysCount, isDay30Completed: is30Done };
  }, [dailyHistory, todayISO]);

  const isDark = theme === 'dark';

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-3xl p-6 sm:p-8 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl mb-10 transition-all">
      
      {/* Top Header Row with Summary Statistics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-6 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white light:text-slate-900">
              30-Day Study Progress Graph
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              Cumulative Growth
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Tracking your consistency, cumulative discipline, and cognitive compound interest.
          </p>
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
              {totalActiveDays} / 30
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

      {/* 30-Day Milestone Badges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {[
          { day: 7, label: 'Day 7: First Week', status: 'Complete' },
          { day: 15, label: 'Day 15: Halfway', status: 'Reached' },
          { day: 21, label: 'Day 21: Habit Locked', status: 'Solidified' },
          { day: 30, label: 'Day 30: Challenge', status: isDay30Completed ? 'Mastered 🏆' : 'In Progress 🚀' },
        ].map(m => (
          <div
            key={m.day}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 text-xs"
          >
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300 light:text-slate-700">{m.label}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">{m.status}</span>
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
              interval={2}
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
        <span>Day 30: Compounded Mastery →</span>
      </div>

    </div>
  );
}
