import React from 'react';
import { useStudy } from '../context/StudyContext';
import { isTaskScheduledForDay } from '../utils/dateUtils';
import { 
  Check, 
  Calendar, 
  Flame, 
  Edit3, 
  Trash2, 
  Clock, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const PRIORITY_STYLES = {
  High: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  Medium: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  Low: {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-500',
  },
};

export default function TaskCard({ task, onEdit, onDelete }) {
  const {
    todayISO,
    todayRecord,
    toggleTask,
    categoryMap,
    weeklyTaskProgressMap,
  } = useStudy();

  const isCompleted = todayRecord.completedTaskIds?.includes(task.id);
  const isScheduledToday = isTaskScheduledForDay(task, todayISO);
  const category = categoryMap[task.categoryId] || { name: 'General', color: 'indigo' };
  const weeklyProgress = weeklyTaskProgressMap[task.id] || { completedDays: 0, target: task.weeklyFrequency || 5, percentage: 0 };
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;

  // Render specific days nicely
  const scheduleLabel = task.specificDays && task.specificDays.length > 0
    ? task.specificDays.length === 7
      ? 'Every day'
      : task.specificDays.join(' • ')
    : `${task.weeklyFrequency || 5} days/wk`;

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-300 border ${
        isCompleted
          ? 'bg-slate-900/60 dark:bg-slate-900/60 light:bg-emerald-50/50 border-emerald-500/30 shadow-md shadow-emerald-500/5'
          : isScheduledToday
          ? 'bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700 shadow-lg'
          : 'bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-50/70 border-dashed border-slate-800/60 light:border-slate-200 opacity-80 hover:opacity-100'
      }`}
    >
      <div className="flex items-start gap-3.5">
        
        {/* Animated Checkbox */}
        <button
          onClick={() => toggleTask(task.id, todayISO)}
          className={`relative mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isCompleted
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 scale-105'
              : 'border-2 border-slate-600 hover:border-indigo-400 bg-slate-800/60 light:bg-white hover:scale-105'
          }`}
          aria-label={isCompleted ? `Mark ${task.name} incomplete` : `Mark ${task.name} complete`}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3] animate-in zoom-in-50 duration-200" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          
          {/* Header row: Name + Points badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`font-semibold text-sm sm:text-base leading-snug transition-colors ${
                isCompleted
                  ? 'text-slate-400 line-through'
                  : 'text-slate-100 light:text-slate-900'
              }`}>
                {task.name}
              </h3>
            </div>

            {/* Points earned/available badge */}
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shrink-0 ${
              category.isSkillCategory
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              +{task.points} Pts
            </div>
          </div>

          {/* Badges: Category, Priority, Schedule */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            
            {/* Category tag */}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 light:bg-slate-100 text-slate-300 light:text-slate-600 border border-slate-700/60 light:border-slate-200">
              {category.name}
            </span>

            {/* Priority Indicator */}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${priorityStyle.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              {task.priority} Priority
            </span>

            {/* Scheduled Day badge */}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${
              isScheduledToday
                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 italic'
            }`}>
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{scheduleLabel}</span>
            </span>

            {/* If not scheduled today, clearly inform the user */}
            {!isScheduledToday && (
              <span className="text-[10px] text-slate-400 font-normal px-2 py-0.5 rounded bg-slate-800/50">
                Rest/Off day (no penalty)
              </span>
            )}

          </div>

          {/* Weekly Progress Bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>Weekly: {weeklyProgress.completedDays}/{weeklyProgress.target} days</span>
                <span className={weeklyProgress.isTargetMet ? 'text-emerald-400 font-bold' : ''}>
                  {weeklyProgress.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    weeklyProgress.isTargetMet
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}
                  style={{ width: `${weeklyProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* Action Buttons: Edit / Delete */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
                title="Edit Task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
