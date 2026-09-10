import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getLastNDays, formatShortDate, parseISODate, DAYS_OF_WEEK } from '../utils/dateUtils';
import { 
  ResponsiveContainer, 
  ComposedChart,
  Area, 
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { 
  Flame, 
  Award, 
  Calendar, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Layers,
  Zap
} from 'lucide-react';

// Timeframe Filter Presets
const TIMEFRAMES = [
  { id: 'weekly', label: 'Weekly', subLabel: '7D', days: 7, interval: 0 },
  { id: 'monthly', label: 'Monthly', subLabel: '30D', days: 30, interval: 3 },
  { id: '50days', label: 'Last 50 Days', subLabel: '50D', days: 50, interval: 6 },
  { id: 'total', label: 'Total (100 Days)', subLabel: '100D', days: 100, interval: 12 },
];

// Metric Mode Presets
const METRIC_MODES = [
  { 
    id: 'completion', 
    label: 'Daily Progress (%)', 
    shortLabel: 'Daily Progress %',
    icon: Target, 
    unit: '%',
    description: 'Directly reflects your daily mission completion rate (0 - 100%)' 
  },
  { 
    id: 'score', 
    label: 'Credit Score (0-1000)', 
    shortLabel: 'Credit Score',
    icon: TrendingUp, 
    unit: 'pts',
    description: 'Tracks your cognitive compound discipline score over time' 
  },
  { 
    id: 'points', 
    label: 'Daily Points (XP)', 
    shortLabel: 'Daily XP',
    icon: Zap, 
    unit: 'XP',
    description: 'Tracks high-leverage points earned on completed missions' 
  },
  { 
    id: 'combined', 
    label: 'Dual View (Progress + Score)', 
    shortLabel: 'Dual View',
    icon: Layers, 
    unit: '% / pts',
    description: 'Visualizes daily progress % alongside your compounding credit score' 
  },
];

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isToday = data.isToday;

    return (
      <div className="bg-slate-900/95 dark:bg-slate-900/95 light:bg-white p-4 rounded-2xl border border-slate-700/80 light:border-slate-300 shadow-2xl backdrop-blur-xl text-white light:text-slate-900 min-w-[240px]">
        {/* Date header */}
        <div className="flex items-center justify-between border-b border-slate-800 light:border-slate-200 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-indigo-400">
              {data.fullDateLabel}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              (D{data.dayIndex})
            </span>
          </div>
          {isToday ? (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              • Today
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">
              {data.dayName}
            </span>
          )}
        </div>

        {/* Daily Completion Progress Bar inside Tooltip */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 light:text-slate-600 font-medium">Daily Progress:</span>
            <span className={`font-mono font-bold text-sm ${
              data.completionPercentage === 100
                ? 'text-emerald-400'
                : data.completionPercentage >= 50
                ? 'text-indigo-400'
                : 'text-amber-400'
            }`}>
              {data.completionPercentage}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 light:bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                data.completionPercentage === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : data.completionPercentage >= 50
                  ? 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-orange-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, data.completionPercentage))}%` }}
            />
          </div>
        </div>

        {/* Metric details */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Missions Completed:</span>
            <span className="font-mono font-bold text-slate-200 light:text-slate-800">
              {data.completedCount} / {data.totalCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Credit Score:</span>
            <span className="font-mono font-bold text-indigo-400">{data.score}</span>
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
            <Award className="w-3.5 h-3.5 shrink-0" />
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
    todayRecord,
    todayCompletedCount,
    todayTotalCount,
    todayPoints,
    theme,
  } = useStudy();

  // Active timeframe state: default 'weekly' (7 days)
  const [timeframe, setTimeframe] = useState('weekly');

  // Active metric mode: default 'combined' (Dual View as shown in screenshot)
  const [metricMode, setMetricMode] = useState('combined');

  const currentTfConfig = useMemo(() => {
    return TIMEFRAMES.find(t => t.id === timeframe) || TIMEFRAMES[0];
  }, [timeframe]);

  const currentMetricConfig = useMemo(() => {
    return METRIC_MODES.find(m => m.id === metricMode) || METRIC_MODES[3];
  }, [metricMode]);

  // Generate chart data based on selected timeframe & live useStudy state
  const { chartData, totalActiveDays, isFinalMilestoneMet, minScore, maxScore } = useMemo(() => {
    const dates = getLastNDays(new Date(), currentTfConfig.days);
    let activeDaysCount = 0;
    let computedMinScore = 1000;
    let computedMaxScore = 0;

    const data = dates.map((iso, idx) => {
      const dayIndex = idx + 1;
      const isToday = iso === todayISO;
      const d = parseISODate(iso);
      const dayOfWeekKey = DAYS_OF_WEEK[d.getDay()]?.key || '';

      const rec = dailyHistory[iso];

      // Live fallback for today so ticking any checkbox triggers an instant, buttery-smooth graph climb
      const completionPercentage = isToday
        ? todayCompletionPct
        : (rec?.completionPercentage ?? 0);

      const score = isToday
        ? currentCreditScore
        : (rec?.creditScoreAfterCompletion ?? rec?.cumulativeProgressScore ?? 500);

      const dailyPoints = isToday
        ? todayPoints
        : (rec?.dailyPoints ?? 0);

      const completedSkills = isToday
        ? (todayRecord?.completedSkills || rec?.completedSkills || [])
        : (rec?.completedSkills || []);

      const completedCount = isToday
        ? todayCompletedCount
        : (rec?.completedTaskIds?.length ?? 0);

      const totalCount = isToday
        ? todayTotalCount
        : (rec?.scheduledTaskIds?.length ?? (rec?.completedTaskIds?.length ? rec.completedTaskIds.length : 0));

      if (score < computedMinScore) computedMinScore = score;
      if (score > computedMaxScore) computedMaxScore = score;

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

      // X-Axis Display Labels
      const displayDate = isToday ? 'Today' : formatShortDate(iso);
      const dayName = isToday ? 'Today' : dayOfWeekKey;
      const fullDateLabel = isToday ? `Today (${formatShortDate(iso)})` : `${dayOfWeekKey}, ${formatShortDate(iso)}`;

      // Distinct label for X-Axis ticks:
      // For Weekly (7 days), show actual day names (Wed, Thu, Fri, Sat, Sun, Mon, Today)
      const xTickLabel = currentTfConfig.days === 7
        ? (isToday ? 'Today' : dayOfWeekKey)
        : (isToday ? 'Today' : formatShortDate(iso));

      return {
        dayIndex,
        date: iso,
        xTickLabel,
        displayDate,
        dayName,
        fullDateLabel,
        score,
        completionPercentage,
        dailyPoints,
        completedCount,
        totalCount,
        completedSkills,
        isToday,
        milestone,
      };
    });

    const lastDay = data[data.length - 1];
    const isDone = lastDay && lastDay.completionPercentage >= 70;

    return { 
      chartData: data, 
      totalActiveDays: activeDaysCount, 
      isFinalMilestoneMet: isDone,
      minScore: computedMinScore,
      maxScore: computedMaxScore,
    };
  }, [
    dailyHistory, 
    todayISO, 
    currentTfConfig, 
    todayCompletionPct, 
    currentCreditScore, 
    todayPoints, 
    todayRecord, 
    todayCompletedCount, 
    todayTotalCount
  ]);

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

  // Dynamic YAxis domain for Credit Score to ensure variations are clearly visible
  const scoreYDomain = useMemo(() => {
    const floorMin = Math.max(0, Math.floor((minScore - 35) / 50) * 50);
    const ceilMax = Math.min(1000, Math.ceil((maxScore + 35) / 50) * 50);
    return [floorMin, Math.max(ceilMax, floorMin + 150)];
  }, [minScore, maxScore]);

  // Today item from chart data
  const todayItem = useMemo(() => {
    return chartData.find(d => d.isToday) || chartData[chartData.length - 1];
  }, [chartData]);

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-3xl p-6 sm:p-8 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl mb-10 transition-all">
      
      {/* Top Header Row with Title, Metric Switcher & Timeframe Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 mb-6 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
        
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white light:text-slate-900">
              Study Progress & Momentum Graph
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              {currentTfConfig.label} ({currentTfConfig.subLabel})
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 max-w-2xl">
            {currentMetricConfig.description}
          </p>

          {/* Metric Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-400 light:text-slate-600 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Metric:</span>
            </span>
            {METRIC_MODES.map(m => {
              const Icon = m.icon;
              const isActive = m.id === metricMode;
              return (
                <button
                  key={m.id}
                  onClick={() => setMetricMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-600/30 scale-105 border border-indigo-400/40'
                      : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 text-slate-400 hover:text-white light:hover:text-slate-900 border border-slate-800 light:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{m.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Timeframe Selector Pill Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
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

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full xl:w-auto shrink-0">
          
          {/* Today's Completion Card */}
          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3.5 rounded-2xl border border-slate-800/80 light:border-slate-200 text-center relative overflow-hidden group">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" />
              <span>Today's Progress</span>
            </div>
            <div className={`text-xl font-black font-mono mt-1 ${
              todayCompletionPct === 100 
                ? 'text-emerald-400' 
                : todayCompletionPct > 0 
                ? 'text-indigo-400' 
                : 'text-slate-400'
            }`}>
              {todayCompletionPct}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {todayCompletedCount}/{todayTotalCount} Done
            </div>
          </div>

          {/* Progress Score Card */}
          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3.5 rounded-2xl border border-slate-800/80 light:border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              <span>Credit Score</span>
            </div>
            <div className="text-xl font-black font-mono text-indigo-400 mt-1">
              {currentCreditScore}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Cognitive Level
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3.5 rounded-2xl border border-slate-800/80 light:border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Streak</span>
            </div>
            <div className="text-xl font-black font-mono text-amber-400 flex items-center justify-center gap-1 mt-1">
              <span>{currentStreak}d</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Unbroken
            </div>
          </div>

          {/* Days Active Card */}
          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3.5 rounded-2xl border border-slate-800/80 light:border-slate-200 text-center">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>Days Active</span>
            </div>
            <div className="text-xl font-black font-mono text-slate-200 light:text-slate-800 mt-1">
              {totalActiveDays} / {currentTfConfig.days}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              In this range
            </div>
          </div>

        </div>

      </div>

      {/* Real-time "Today's Orbit" Reactive Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-100 border border-slate-800/80 light:border-slate-300 mb-6">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${
            todayCompletionPct === 100
              ? 'bg-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse'
              : todayCompletionPct > 0
              ? 'bg-indigo-400 shadow-[0_0_10px_#6366f1] animate-pulse'
              : 'bg-slate-500'
          }`} />
          <span className="text-xs sm:text-sm font-bold text-white light:text-slate-900">
            Today's Live Orbit:
          </span>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            todayCompletionPct === 100
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : todayCompletionPct > 0
              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {todayCompletionPct}% Completed ({todayCompletedCount}/{todayTotalCount} Missions)
          </span>
        </div>
        <div className="text-xs font-medium text-slate-400 light:text-slate-600">
          {todayCompletionPct === 100 ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span>🎉 Perfect Day! All scheduled missions conquered. Max momentum locked!</span>
            </span>
          ) : todayCompletionPct > 0 ? (
            <span className="text-indigo-300 flex items-center gap-1">
              <span>⚡ Live Sync: Checking off missions immediately raises this graph curve!</span>
            </span>
          ) : (
            <span className="text-slate-400">
              Tick off today's missions above to watch this graph rise in real time! 🚀
            </span>
          )}
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

      {/* Recharts Curved Area / Composed Chart */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
            <defs>
              {/* Emerald to Indigo Gradient for Daily Progress */}
              <linearGradient id="completionAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.65} />
                <stop offset="50%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>

              {/* Indigo to Purple Gradient for Credit Score */}
              <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>

              {/* Amber to Rose Gradient for Daily Points */}
              <linearGradient id="pointsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#334155' : '#e2e8f0'}
              opacity={0.35}
              vertical={false}
            />

            {/* X-Axis */}
            <XAxis
              dataKey="dayIndex"
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickFormatter={val => {
                const item = chartData[val - 1];
                return item?.xTickLabel || `D${val}`;
              }}
              interval={currentTfConfig.interval}
            />

            {/* Left Y-Axis for Primary Metric */}
            {metricMode === 'completion' && (
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={val => `${val}%`}
              />
            )}

            {metricMode === 'score' && (
              <YAxis
                domain={scoreYDomain}
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
            )}

            {metricMode === 'points' && (
              <YAxis
                domain={[0, 'auto']}
                tickLine={false}
                axisLine={false}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={val => `+${val}`}
              />
            )}

            {metricMode === 'combined' && (
              <>
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={val => `${val}%`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={scoreYDomain}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: isDark ? '#818cf8' : '#4f46e5', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
              </>
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* Reference Guidelines for Daily Progress */}
            {(metricMode === 'completion' || metricMode === 'combined') && (
              <>
                <ReferenceLine
                  y={100}
                  yAxisId={metricMode === 'combined' ? 'left' : undefined}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: '100% Target 🎯',
                    fill: '#10b981',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceLine
                  y={50}
                  yAxisId={metricMode === 'combined' ? 'left' : undefined}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  strokeOpacity={0.35}
                  label={{
                    value: '50% Momentum',
                    fill: '#f59e0b',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                />
              </>
            )}

            {/* RENDER PLOT BASED ON METRIC MODE */}

            {/* 1. Daily Progress Rate (%) Mode */}
            {metricMode === 'completion' && (
              <Area
                type="monotone"
                dataKey="completionPercentage"
                stroke="#10b981"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#completionAreaGradient)"
                isAnimationActive={true}
                animationDuration={700}
                animationEasing="ease-out"
                activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2.5 }}
              />
            )}

            {/* 2. Credit Score (0 - 1000) Mode */}
            {metricMode === 'score' && (
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#scoreAreaGradient)"
                isAnimationActive={true}
                animationDuration={700}
                animationEasing="ease-out"
                activeDot={{ r: 7, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2.5 }}
              />
            )}

            {/* 3. Daily XP Points Mode */}
            {metricMode === 'points' && (
              <Area
                type="monotone"
                dataKey="dailyPoints"
                stroke="#f59e0b"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#pointsAreaGradient)"
                isAnimationActive={true}
                animationDuration={700}
                animationEasing="ease-out"
                activeDot={{ r: 7, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2.5 }}
              />
            )}

            {/* 4. Combined Dual View Mode */}
            {metricMode === 'combined' && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="completionPercentage"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={0.8}
                  fill="url(#completionAreaGradient)"
                  isAnimationActive={true}
                  animationDuration={700}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="score"
                  stroke="#818cf8"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#818cf8' }}
                  activeDot={{ r: 6, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={700}
                />
              </>
            )}

            {/* Today Reference Dot - Highlighted Beacon */}
            {todayItem && (
              <ReferenceDot
                x={todayItem.dayIndex}
                y={
                  metricMode === 'completion'
                    ? todayItem.completionPercentage
                    : metricMode === 'score'
                    ? todayItem.score
                    : metricMode === 'points'
                    ? todayItem.dailyPoints
                    : todayItem.completionPercentage // left axis for combined
                }
                yAxisId={metricMode === 'combined' ? 'left' : undefined}
                r={8}
                fill={
                  metricMode === 'completion'
                    ? (todayItem.completionPercentage === 100 ? '#10b981' : todayItem.completionPercentage > 0 ? '#38bdf8' : '#64748b')
                    : '#10b981'
                }
                stroke="#ffffff"
                strokeWidth={2.5}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Bottom Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 light:text-slate-600 mt-4 pt-4 border-t border-slate-800/80 light:border-slate-200 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300 light:text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Daily Progress %</span>
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>Credit Compounding</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Today ({todayItem?.xTickLabel}): {todayCompletionPct}% Complete</span>
        </div>
      </div>

    </div>
  );
}
