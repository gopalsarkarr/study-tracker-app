import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  getMonthCalendarGrid, 
  getISODate, 
  parseISODate, 
  DAYS_OF_WEEK 
} from '../utils/dateUtils';
import DailyDetailModal from './DailyDetailModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Calendar, 
  Check, 
  Sparkles, 
  Flame,
  Info
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ActivityCalendar() {
  const {
    todayISO,
    dailyHistory,
    tasks,
    categoryMap,
  } = useStudy();

  // Current calendar view (year and monthIndex)
  const todayDateObj = useMemo(() => parseISODate(todayISO), [todayISO]);
  const [viewYear, setViewYear] = useState(() => todayDateObj.getFullYear());
  const [viewMonthIndex, setViewMonthIndex] = useState(() => todayDateObj.getMonth());

  // Modal for detail view
  const [selectedCellDate, setSelectedCellDate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Month grid days
  const calendarGrid = useMemo(() => {
    return getMonthCalendarGrid(viewYear, viewMonthIndex);
  }, [viewYear, viewMonthIndex]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonthIndex === 0) {
      setViewMonthIndex(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewMonthIndex(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonthIndex(prev => prev + 1);
    }
  };

  const handleReturnToday = () => {
    setViewYear(todayDateObj.getFullYear());
    setViewMonthIndex(todayDateObj.getMonth());
  };

  const openDateDetail = (isoDate) => {
    setSelectedCellDate(isoDate);
    setIsDetailOpen(true);
  };

  /**
   * Determine cell color and styling based on completion percentage and date position
   */
  const getCellStyling = (cell) => {
    const isToday = cell.date === todayISO;
    const isPast = cell.date < todayISO;
    const isFuture = cell.date > todayISO;
    const record = dailyHistory[cell.date];
    const pct = record?.completionPercentage || 0;
    const hasCompleted = record?.completedTaskIds?.length > 0;
    const scheduledCount = record?.scheduledTaskIds?.length || 0;

    let bgClass = 'bg-slate-900/40 light:bg-slate-50 border-slate-800/80 light:border-slate-200 text-slate-400';
    let label = 'No Activity';

    if (isFuture) {
      bgClass = 'bg-slate-950/30 light:bg-slate-50/50 border-dashed border-slate-800/40 light:border-slate-200/60 text-slate-600';
      label = 'Upcoming';
    } else if (pct === 100 && (hasCompleted || scheduledCount > 0)) {
      // 100% Strongest premium green
      bgClass = 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold border-emerald-400 shadow-md shadow-emerald-500/20';
      label = '100% Perfect';
    } else if (pct >= 76) {
      // 76-99% Dark green
      bgClass = 'bg-emerald-600 text-white font-semibold border-emerald-500 shadow-sm';
      label = `${pct}% Conquered`;
    } else if (pct >= 51) {
      // 51-75% Medium green
      bgClass = 'bg-emerald-700/80 dark:bg-emerald-700/80 light:bg-emerald-500 text-white border-emerald-600';
      label = `${pct}% Solid`;
    } else if (pct >= 26) {
      // 26-50% Light green
      bgClass = 'bg-emerald-900/70 dark:bg-emerald-900/70 light:bg-emerald-200 text-emerald-200 light:text-emerald-900 border-emerald-800';
      label = `${pct}% Steady`;
    } else if (pct >= 1) {
      // 1-25% Very light green
      bgClass = 'bg-emerald-950/60 dark:bg-emerald-950/60 light:bg-emerald-100 text-emerald-300 light:text-emerald-800 border-emerald-900/60';
      label = `${pct}% Started`;
    } else if (isPast && scheduledCount > 0) {
      // 0% Completed on a past ended day: Red ("No Progress")
      bgClass = 'bg-rose-950/50 dark:bg-rose-950/50 light:bg-rose-50 text-rose-300 light:text-rose-700 border-rose-900/60 light:border-rose-200';
      label = '0% Missed';
    }

    return { bgClass, label, pct, record, isToday, isFuture, isPast };
  };

  return (
    <section className="w-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-3xl p-6 sm:p-8 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl mb-10 transition-all">
      
      {/* Calendar Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white light:text-slate-900">
              Monthly Study Activity Calendar
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Heatmap OS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            GitHub-style contribution intensity visualizing your consistency, study scores, and perfect days.
          </p>
        </div>

        {/* Navigation Controls: Prev, Month Title, Next, Return to Today */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={handleReturnToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 light:text-slate-700 bg-slate-950/80 light:bg-slate-100 hover:bg-slate-800 border border-slate-800 light:border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Today</span>
          </button>

          <div className="flex items-center bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100 rounded-xl border border-slate-800 light:border-slate-200 p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-200 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-bold font-mono text-slate-200 light:text-slate-800 min-w-[130px] text-center">
              {MONTH_NAMES[viewMonthIndex]} {viewYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-200 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS_OF_WEEK.map(d => (
          <div
            key={d.key}
            className="text-center text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 light:text-slate-500 py-1"
          >
            {d.key}
          </div>
        ))}
      </div>

      {/* 7-Column Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
        {calendarGrid.map(cell => {
          const style = getCellStyling(cell);
          const hasSkills = style.record?.completedSkills && style.record.completedSkills.length > 0;
          const scoreDelta = style.record?.scoreChange || 0;

          return (
            <div
              key={cell.date}
              onClick={() => openDateDetail(cell.date)}
              className={`group relative rounded-2xl p-2 sm:p-2.5 min-h-[75px] sm:min-h-[90px] border cursor-pointer transition-all duration-200 flex flex-col justify-between hover:scale-[1.03] hover:z-20 hover:shadow-xl ${
                style.bgClass
              } ${
                !cell.isCurrentMonth ? 'opacity-35 hover:opacity-80' : ''
              } ${
                style.isToday ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''
              }`}
            >
              {/* Cell Header: Date Number + Today Flag or Checkmark */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold">
                  {cell.dayNumber}
                </span>

                {style.isToday ? (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-indigo-500 text-white animate-pulse">
                    Today
                  </span>
                ) : style.pct === 100 ? (
                  <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                ) : scoreDelta !== 0 ? (
                  <span className={`text-[10px] font-mono font-bold ${
                    scoreDelta > 0 ? 'text-emerald-300' : 'text-rose-400'
                  }`}>
                    {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                  </span>
                ) : null}
              </div>

              {/* Cell Middle: Score / Points */}
              <div className="my-1">
                {style.record && style.record.dailyPoints > 0 ? (
                  <div className="text-[11px] font-mono font-bold leading-none truncate">
                    +{style.record.dailyPoints} pts
                  </div>
                ) : style.pct === 0 && style.isPast ? (
                  <div className="text-[10px] font-mono text-rose-400 leading-none">
                    No Progress
                  </div>
                ) : null}
              </div>

              {/* Cell Footer: Mini skills indicators */}
              <div className="flex items-center justify-between gap-1 overflow-hidden">
                {hasSkills ? (
                  <div className="flex items-center gap-0.5 max-w-full truncate">
                    {style.record.completedSkills.slice(0, 2).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-medium px-1 rounded bg-black/30 truncate max-w-[65px]"
                        title={skill}
                      >
                        {skill.split(' ')[0]}
                      </span>
                    ))}
                    {style.record.completedSkills.length > 2 && (
                      <span className="text-[9px] font-mono font-bold opacity-80">
                        +{style.record.completedSkills.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[9px] font-mono opacity-60">
                    {style.pct > 0 ? `${style.pct}%` : ''}
                  </span>
                )}
              </div>

              {/* Quick Hover Tooltip preview */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none whitespace-nowrap bg-slate-950 text-white text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-xl">
                <div className="font-bold">{cell.date}</div>
                <div>{style.label}</div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Heatmap Legend Bar */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 light:text-slate-600 font-mono">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any day to view detailed missions, completed subjects & score changes</span>
        </div>

        {/* Color Legend scale */}
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-950/80 border border-rose-900" title="0% Missed" />
            <span className="w-3 h-3 rounded bg-slate-900/60 border border-slate-800" title="No tasks" />
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-900" title="1-25%" />
            <span className="w-3 h-3 rounded bg-emerald-900 border border-emerald-800" title="26-50%" />
            <span className="w-3 h-3 rounded bg-emerald-700 border border-emerald-600" title="51-75%" />
            <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-500" title="76-99%" />
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400 shadow-sm" title="100% Perfect Day" />
          </div>
          <span>100% Perfect</span>
        </div>
      </div>

      {/* Daily Detail Audit Modal */}
      <DailyDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        targetDateISO={selectedCellDate}
      />

    </section>
  );
}
