import React from 'react';
import { useStudy } from '../context/StudyContext';
import { formatFullDate, isTaskScheduledForDay } from '../utils/dateUtils';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Gauge, 
  Award, 
  TrendingUp, 
  TrendingDown,
  CalendarCheck,
  ExternalLink
} from 'lucide-react';

export default function DailyDetailModal({ isOpen, onClose, targetDateISO }) {
  const {
    tasks,
    dailyHistory,
    categoryMap,
    toggleTask,
  } = useStudy();

  if (!isOpen || !targetDateISO) return null;

  const record = dailyHistory[targetDateISO] || {
    date: targetDateISO,
    completedTaskIds: [],
    completedSkills: [],
    dailyPoints: 0,
    completionPercentage: 0,
    scoreChange: 0,
    creditScoreAfterCompletion: 500,
  };

  // Scheduled tasks for this specific day
  const scheduledTasks = tasks.filter(t => isTaskScheduledForDay(t, targetDateISO));
  const completedIds = record.completedTaskIds || [];

  const completedList = scheduledTasks.filter(t => completedIds.includes(t.id));
  const incompleteList = scheduledTasks.filter(t => !completedIds.includes(t.id));

  const isPerfect = scheduledTasks.length > 0 && completedList.length === scheduledTasks.length;
  const isMissed = scheduledTasks.length > 0 && completedList.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white w-full max-w-lg rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isPerfect
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : isMissed
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
            }`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
                Daily Mission Audit
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500">
                {formatFullDate(targetDateISO)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            
            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3 rounded-2xl border border-slate-800 light:border-slate-200">
              <div className="text-[11px] text-slate-400 font-medium">Daily Progress</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {record.completionPercentage}%
              </div>
              <div className="text-[10px] text-slate-500">
                {completedList.length}/{scheduledTasks.length} Done
              </div>
            </div>

            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3 rounded-2xl border border-slate-800 light:border-slate-200">
              <div className="text-[11px] text-slate-400 font-medium">Points Earned</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                +{record.dailyPoints}
              </div>
              <div className="text-[10px] text-slate-500">Study Points</div>
            </div>

            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-3 rounded-2xl border border-slate-800 light:border-slate-200">
              <div className="text-[11px] text-slate-400 font-medium">Score Delta</div>
              <div className={`text-xl font-bold font-mono flex items-center justify-center gap-0.5 ${
                record.scoreChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {record.scoreChange >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>+{record.scoreChange}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    <span>{record.scoreChange}</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-slate-500">
                Credit Impact
              </div>
            </div>

          </div>

          {/* Status Alert Banner */}
          {isPerfect && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <Award className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                <strong>Perfect Day!</strong> Every single scheduled study and discipline task was mastered.
              </span>
            </div>
          )}

          {isMissed && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <Flame className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Zero Missed Days Mentality:</strong> One tough day does not define your journey. You can rebound today!
              </span>
            </div>
          )}

          {/* Completed Tasks List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Missions ({completedList.length})</span>
            </h4>

            {completedList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-950/40 border border-slate-800/40">
                No tasks were completed on this date.
              </p>
            ) : (
              <div className="space-y-2">
                {completedList.map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="font-semibold text-slate-200 light:text-slate-800 truncate">
                        {t.name}
                      </span>
                      {t.linkUrl && (
                        <a
                          href={t.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400/80 hover:text-emerald-300 p-0.5"
                          title={`Open ${t.linkUrl}`}
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                    </div>
                    <span className="font-mono text-emerald-400 font-bold shrink-0">
                      +{t.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incomplete Tasks List */}
          {incompleteList.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Circle className="w-4 h-4" />
                <span>Scheduled / Remaining ({incompleteList.length})</span>
              </h4>

              <div className="space-y-2">
                {incompleteList.map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex items-center justify-between gap-3 text-xs opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-500">○</span>
                      <span className="text-slate-300 light:text-slate-700 truncate">
                        {t.name}
                      </span>
                      {t.linkUrl && (
                        <a
                          href={t.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 p-0.5"
                          title={`Open ${t.linkUrl}`}
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => toggleTask(t.id, targetDateISO)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all shrink-0"
                    >
                      Mark Done
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
}
