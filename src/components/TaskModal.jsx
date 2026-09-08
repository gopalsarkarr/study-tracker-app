import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { X, Sparkles, Check, AlertCircle, Link2, ExternalLink, Globe } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, initialTask = null, defaultCategoryId = 'skills-study' }) {
  const { categories, addTask, updateTask } = useStudy();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [points, setPoints] = useState(30);
  const [priority, setPriority] = useState('Medium');
  const [weeklyFrequency, setWeeklyFrequency] = useState(5);
  const [specificDays, setSpecificDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setName(initialTask.name || '');
      setCategoryId(initialTask.categoryId || defaultCategoryId);
      setPoints(initialTask.points || 30);
      setPriority(initialTask.priority || 'Medium');
      setWeeklyFrequency(initialTask.weeklyFrequency || 5);
      setSpecificDays(initialTask.specificDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
      setLinkUrl(initialTask.linkUrl || '');
    } else {
      setName('');
      setCategoryId(defaultCategoryId);
      setPoints(defaultCategoryId === 'skills-study' ? 35 : 5);
      setPriority('Medium');
      setWeeklyFrequency(5);
      setSpecificDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
      setLinkUrl(defaultCategoryId === 'skills-study' ? 'https://leetcode.com/u/gopalsarkar/' : '');
    }
    setError('');
  }, [initialTask, defaultCategoryId, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayKey) => {
    setSpecificDays(prev => {
      const exists = prev.includes(dayKey);
      let updated;
      if (exists) {
        if (prev.length === 1) return prev; // Keep at least one day
        updated = prev.filter(d => d !== dayKey);
      } else {
        updated = [...prev, dayKey];
      }
      setWeeklyFrequency(updated.length);
      return updated;
    });
  };

  const handleFrequencyChange = (freq) => {
    const num = Number(freq);
    setWeeklyFrequency(num);
    // Automatically select first N days of the week for convenience
    const defaultDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, num);
    setSpecificDays(defaultDays);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Task name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId,
      points: Number(points) || 10,
      priority,
      weeklyFrequency: Number(weeklyFrequency) || specificDays.length,
      specificDays,
      linkUrl: linkUrl.trim(),
    };

    if (initialTask) {
      updateTask(initialTask.id, payload);
    } else {
      addTask(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white w-full max-w-lg rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl overflow-hidden transition-all">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white light:text-slate-900">
              {initialTask ? 'Edit Mission / Task' : 'Add New Mission / Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1.5">
              Task / Skill Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dynamic Programming Practice or 20 Pages Reading"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              autoFocus
            />
          </div>

          {/* Resource / Problem Link URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Resource / Mission Link (URL)</span>
              </label>
              <span className="text-[11px] text-slate-500">Optional</span>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="e.g. https://leetcode.com/problems/... or https://youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono"
            />
            {/* Quick helper shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 font-medium">Quick link:</span>
              <button
                type="button"
                onClick={() => setLinkUrl('https://leetcode.com/u/gopalsarkar/')}
                className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
              >
                + My LeetCode
              </button>
              <button
                type="button"
                onClick={() => setLinkUrl('https://classroom.sheryians.com/')}
                className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
              >
                + Sheryians Class
              </button>
              <button
                type="button"
                onClick={() => setLinkUrl('https://www.youtube.com')}
                className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
              >
                + YouTube
              </button>
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500 mt-1">
              You can click this link to solve the problem or watch the video before checking the task complete!
            </p>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={e => {
                const newCat = e.target.value;
                setCategoryId(newCat);
                if (newCat === 'skills-study' && points < 20) setPoints(35);
                if (newCat === 'daily-routine' && points > 10) setPoints(5);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.importance})
                </option>
              ))}
            </select>
          </div>

          {/* Points & Priority Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Points Value */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600">
                  Point Value
                </label>
                <span className="text-xs text-indigo-400 font-mono font-bold">
                  +{points} pts
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={e => setPoints(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Recommended: 20-50 for Skills, 2-10 for Routine
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

          </div>

          {/* Weekly Target Frequency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600">
                Weekly Target: <span className="text-indigo-400 font-mono font-bold">{weeklyFrequency} Days/Week</span>
              </label>
            </div>
            
            {/* Quick frequency buttons (1 - 7) */}
            <div className="flex items-center gap-1.5 mb-3">
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => handleFrequencyChange(num)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    weeklyFrequency === num
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/80 light:bg-slate-100 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                  }`}
                >
                  {num}d
                </button>
              ))}
            </div>

            {/* Specific Weekdays Toggles */}
            <label className="block text-[11px] text-slate-400 light:text-slate-600 mb-1.5">
              Specific Weekdays (scheduled vs non-scheduled rest days):
            </label>
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const isSelected = specificDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                        : 'bg-slate-950 dark:bg-slate-950 light:bg-slate-100 text-slate-500 border border-slate-800 dark:border-slate-800 light:border-slate-200'
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              Non-scheduled days do not count as missed days and will not damage your score or streak.
            </p>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
