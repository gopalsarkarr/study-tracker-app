import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { X, FolderPlus, Rocket, Sun, Dumbbell, BookOpen, Brain, Target, Laptop, Flame, Award } from 'lucide-react';

const AVAILABLE_ICONS = [
  { name: 'Rocket', icon: Rocket },
  { name: 'Sun', icon: Sun },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Brain', icon: Brain },
  { name: 'Target', icon: Target },
  { name: 'Laptop', icon: Laptop },
  { name: 'Flame', icon: Flame },
];

export default function CategoryModal({ isOpen, onClose, initialCategory = null }) {
  const { addCategory, updateCategory } = useStudy();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Rocket');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState('Medium Impact');
  const [multiplier, setMultiplier] = useState(1.2);
  const [isSkillCategory, setIsSkillCategory] = useState(false);
  const [color, setColor] = useState('indigo');

  const prevOpenRef = useRef(false);
  const prevCatIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      prevOpenRef.current = false;
      return;
    }

    const isJustOpened = !prevOpenRef.current && isOpen;
    const isCatChanged = initialCategory?.id !== prevCatIdRef.current;

    if (isJustOpened || isCatChanged) {
      prevOpenRef.current = true;
      prevCatIdRef.current = initialCategory?.id || null;

      if (initialCategory) {
        setName(initialCategory.name || '');
        setIcon(initialCategory.icon || 'Rocket');
        setDescription(initialCategory.description || '');
        setImportance(initialCategory.importance || 'Medium Impact');
        setMultiplier(initialCategory.multiplier || 1.2);
        setIsSkillCategory(Boolean(initialCategory.isSkillCategory));
        setColor(initialCategory.color || 'indigo');
      } else {
        setName('');
        setIcon('Target');
        setDescription('');
        setImportance('Medium Impact');
        setMultiplier(1.2);
        setIsSkillCategory(false);
        setColor('indigo');
      }
    }
  }, [initialCategory?.id, isOpen]);

  if (!isOpen) return null;

  const handleImportanceChange = (val) => {
    setImportance(val);
    if (val === 'High Impact') {
      setMultiplier(2.2);
      setIsSkillCategory(true);
    } else if (val === 'Medium Impact') {
      setMultiplier(1.2);
      setIsSkillCategory(false);
    } else {
      setMultiplier(0.4);
      setIsSkillCategory(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      icon,
      description: description.trim(),
      importance,
      multiplier: Number(multiplier) || 1.0,
      isSkillCategory,
      color,
    };

    if (initialCategory) {
      updateCategory(initialCategory.id, payload);
    } else {
      addCategory(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between shrink-0 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
              {initialCategory ? 'Edit Category' : 'Create Custom Category'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with Scrollable Area and Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Competitive Coding, Languages, Yoga"
                className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
                autoFocus
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-2">
                Category Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_ICONS.map(item => {
                  const IconComponent = item.icon;
                  const isSelected = icon === item.name;
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setIcon(item.name)}
                      className={`p-2.5 rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-950 dark:bg-slate-950 light:bg-slate-100 text-slate-400 border-slate-800 dark:border-slate-800 light:border-slate-200 hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What kind of growth does this category nurture?"
                className="w-full px-3.5 sm:px-4 py-2 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Importance & Multiplier */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1.5">
                Impact Level on Credit Score
              </label>
              <select
                value={importance}
                onChange={e => handleImportanceChange(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="High Impact">High Impact (2.2x multiplier — e.g. Core Skills)</option>
                <option value="Medium Impact">Medium Impact (1.2x multiplier — e.g. Fitness, Reading)</option>
                <option value="Low Impact">Low Impact (0.4x multiplier — e.g. Daily Habits)</option>
              </select>
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-end gap-3 shrink-0 bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50/80 backdrop-blur-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            >
              Save Category
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
