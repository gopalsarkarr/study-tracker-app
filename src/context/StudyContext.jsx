import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getTodayDateString,
  getISODate,
  parseISODate,
  isTaskScheduledForDay,
  calculateStreak,
  getCurrentWeekRange,
} from '../utils/dateUtils';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TASKS,
  generateRealisticHistory,
} from '../data/initialData';
import { calculateDailyScoreDelta } from '../utils/scoringEngine';
import { playSound } from '../utils/soundEffects';
import { categoryService } from '../services/categoryService';
import { taskService } from '../services/taskService';
import { dailyRecordService } from '../services/dailyRecordService';
import { scoreService } from '../services/scoreService';
import { streakService } from '../services/streakService';
import { achievementService } from '../services/achievementService';
import { realtimeService } from '../services/realtimeService';
import confetti from 'canvas-confetti';

const StudyContext = createContext(null);

export function StudyProvider({ children }) {
  const { user } = useAuth();
  const todayISO = useMemo(() => getTodayDateString(), []);

  // Theme & Audio settings
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_study_theme_v1');
      return saved ? JSON.parse(saved) : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_study_sound_v1');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Cloud Synchronization Status: 'synced' | 'syncing' | 'offline' | 'error'
  const [syncStatus, setSyncStatus] = useState('synced');
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [celebration, setCelebration] = useState(null);

  // Entities
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [dailyHistory, setDailyHistory] = useState(() => {
    const { history } = generateRealisticHistory(todayISO, DEFAULT_TASKS, DEFAULT_CATEGORIES);
    return history;
  });
  const [cloudScore, setCloudScore] = useState({ current_score: 742, highest_score: 770 });
  const [cloudStreak, setCloudStreak] = useState({ current_streak: 7, longest_streak: 14 });
  const [achievements, setAchievements] = useState([]);

  // Theme sync
  useEffect(() => {
    try {
      localStorage.setItem('aura_study_theme_v1', JSON.stringify(theme));
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Sound sync
  useEffect(() => {
    try {
      localStorage.setItem('aura_study_sound_v1', JSON.stringify(soundEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [soundEnabled]);

  // Load User Data from Supabase Cloud upon Login
  useEffect(() => {
    if (!user) {
      // Unauthenticated fallback: demo mode
      const { history } = generateRealisticHistory(todayISO, DEFAULT_TASKS, DEFAULT_CATEGORIES);
      setCategories(DEFAULT_CATEGORIES);
      setTasks(DEFAULT_TASKS);
      setDailyHistory(history);
      setCloudScore({ current_score: 742, highest_score: 770 });
      setCloudStreak({ current_streak: 7, longest_streak: 14 });
      setSyncStatus('synced');
      return;
    }

    let isCancelled = false;
    setSyncStatus('syncing');

    async function loadCloudUserData() {
      try {
        // 1. Fetch categories
        let { categories: cloudCats } = await categoryService.getCategories(user.id);
        let cloudTasks = [];

        if (!cloudCats || cloudCats.length === 0) {
          // New user: seed default categories & starter tasks in cloud
          const seeded = await categoryService.seedDefaultsForUser(user.id);
          cloudCats = seeded.categories;
          cloudTasks = seeded.tasks;
        } else {
          const { tasks: t } = await taskService.getTasks(user.id);
          cloudTasks = t || [];
        }

        if (isCancelled) return;

        // Map cloud category schema to frontend format
        const formattedCats = cloudCats.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          description: c.description,
          importance: c.importance_level,
          multiplier: Number(c.point_multiplier),
          isSkillCategory: Boolean(c.is_skill_category),
          color: c.color || 'indigo',
        }));

        // Map cloud tasks schema
        const formattedTasks = cloudTasks.map(t => ({
          id: t.id,
          categoryId: t.category_id,
          name: t.name,
          points: Number(t.points),
          priority: t.priority,
          weeklyFrequency: Number(t.weekly_frequency),
          specificDays: t.specific_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          createdAt: t.created_at,
        }));

        // 2. Fetch Score & Streak
        const { score } = await scoreService.getScore(user.id);
        const { streak } = await streakService.getStreak(user.id);
        const { achievements: achs } = await achievementService.getAchievements(user.id);

        // 3. Fetch completed tasks and daily records
        const { completed } = await dailyRecordService.getCompletedTasks(user.id);
        const { records } = await dailyRecordService.getDailyRecords(user.id);

        if (isCancelled) return;

        // Build unified daily history map
        const historyMap = {};

        // If user has existing daily records in database, populate them
        records.forEach(rec => {
          const dayCompleted = completed.filter(c => c.date === rec.date).map(c => c.task_id);
          historyMap[rec.date] = {
            date: rec.date,
            scheduledTaskIds: formattedTasks.filter(t => isTaskScheduledForDay(t, rec.date)).map(t => t.id),
            completedTaskIds: dayCompleted,
            completedSkills: formattedTasks.filter(t => dayCompleted.includes(t.id) && t.categoryId === formattedCats.find(c => c.isSkillCategory)?.id).map(t => t.name.split(' (')[0]),
            dailyPoints: rec.daily_points,
            completionPercentage: rec.completion_percentage,
            scoreChange: rec.score_change,
            creditScoreAfterCompletion: rec.credit_score_after,
            cumulativeProgressScore: rec.credit_score_after,
          };
        });

        // If new user has no past records, generate 30-day realistic starting history
        if (Object.keys(historyMap).length === 0) {
          const { history } = generateRealisticHistory(todayISO, formattedTasks, formattedCats);
          Object.assign(historyMap, history);
        }

        setCategories(formattedCats);
        setTasks(formattedTasks);
        setDailyHistory(historyMap);
        setCloudScore(score);
        setCloudStreak(streak);
        setAchievements(achs);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Failed to load user cloud data:', err);
        setSyncStatus('error');
      }
    }

    loadCloudUserData();

    // Setup Multi-Device Realtime Subscription
    const subscription = realtimeService.subscribeToUserChanges(user.id, (table, payload) => {
      // Live event from another device
      setSyncStatus('syncing');
      if (table === 'study_scores' && payload.new) {
        setCloudScore(payload.new);
      } else if (table === 'streaks' && payload.new) {
        setCloudStreak(payload.new);
      } else if (table === 'completed_tasks') {
        const { task_id, date } = payload.new || payload.old || {};
        if (date && task_id) {
          setDailyHistory(prev => {
            const existing = prev[date] || {};
            const currentIds = existing.completedTaskIds || [];
            const updatedIds = payload.eventType === 'DELETE'
              ? currentIds.filter(id => id !== task_id)
              : Array.from(new Set([...currentIds, task_id]));
            return {
              ...prev,
              [date]: { ...existing, completedTaskIds: updatedIds },
            };
          });
        }
      }
      setTimeout(() => setSyncStatus('synced'), 400);
    });

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, [user, todayISO]);

  // Category map
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(c => { map[c.id] = c; });
    return map;
  }, [categories]);

  // Current streak
  const currentStreak = useMemo(() => {
    const calculated = calculateStreak(dailyHistory, todayISO);
    return Math.max(calculated, cloudStreak.current_streak || 0);
  }, [dailyHistory, todayISO, cloudStreak]);

  // Current credit score
  const currentCreditScore = useMemo(() => {
    const todayRec = dailyHistory[todayISO];
    if (todayRec && typeof todayRec.creditScoreAfterCompletion === 'number') {
      return Math.min(1000, Math.max(0, todayRec.creditScoreAfterCompletion));
    }
    return cloudScore.current_score || 500;
  }, [dailyHistory, todayISO, cloudScore]);

  // Highest score
  const highestScore = useMemo(() => {
    let max = Math.max(currentCreditScore, cloudScore.highest_score || 500);
    Object.values(dailyHistory).forEach(rec => {
      if (rec.creditScoreAfterCompletion && rec.creditScoreAfterCompletion > max) {
        max = rec.creditScoreAfterCompletion;
      }
    });
    return max;
  }, [dailyHistory, currentCreditScore, cloudScore]);

  // Today's scheduled tasks
  const todayScheduledTasks = useMemo(() => {
    return tasks.filter(t => isTaskScheduledForDay(t, todayISO));
  }, [tasks, todayISO]);

  // Today's completed tasks
  const todayRecord = useMemo(() => {
    return dailyHistory[todayISO] || {
      date: todayISO,
      scheduledTaskIds: todayScheduledTasks.map(t => t.id),
      completedTaskIds: [],
      completedSkills: [],
      dailyPoints: 0,
      completionPercentage: 0,
      scoreChange: 0,
      creditScoreAfterCompletion: currentCreditScore,
    };
  }, [dailyHistory, todayISO, todayScheduledTasks, currentCreditScore]);

  const todayCompletedCount = todayRecord.completedTaskIds?.length || 0;
  const todayTotalCount = todayScheduledTasks.length;
  const todayCompletionPct = todayRecord.completionPercentage || 0;
  const todayPoints = todayRecord.dailyPoints || 0;
  const scoreDeltaToday = todayRecord.scoreChange || 0;
  const isTodayPerfect = todayTotalCount > 0 && todayCompletedCount === todayTotalCount;

  // Weekly progress per task
  const currentWeekDays = useMemo(() => getCurrentWeekRange(new Date()), []);
  const weeklyTaskProgressMap = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      let completedDays = 0;
      currentWeekDays.forEach(dayIso => {
        const rec = dailyHistory[dayIso];
        if (rec && rec.completedTaskIds?.includes(task.id)) {
          completedDays++;
        }
      });
      const target = task.weeklyFrequency || 5;
      const pct = Math.min(100, Math.round((completedDays / target) * 100));
      map[task.id] = {
        completedDays,
        target,
        percentage: pct,
        isTargetMet: completedDays >= target,
      };
    });
    return map;
  }, [tasks, currentWeekDays, dailyHistory]);

  // Celebration trigger
  const triggerCelebration = useCallback((title, subtitle, type = 'general') => {
    setCelebration({ title, subtitle, type });
    if (soundEnabled) {
      playSound(type === 'perfect_day' ? 'perfect_day' : 'milestone', false);
    }
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'],
      });
    } catch (e) {
      console.debug(e);
    }
  }, [soundEnabled]);

  // Toggle Task Completion (Synchronized with Supabase Cloud)
  const toggleTask = useCallback(async (taskId, targetDateISO = todayISO) => {
    const isTargetToday = targetDateISO === todayISO;

    const existingRec = dailyHistory[targetDateISO] || {
      date: targetDateISO,
      scheduledTaskIds: tasks.filter(t => isTaskScheduledForDay(t, targetDateISO)).map(t => t.id),
      completedTaskIds: [],
      completedSkills: [],
      dailyPoints: 0,
      completionPercentage: 0,
      scoreChange: 0,
      creditScoreAfterCompletion: currentCreditScore,
    };

    const scheduledForDay = tasks.filter(t => isTaskScheduledForDay(t, targetDateISO));
    const currentCompleted = existingRec.completedTaskIds || [];
    const isAlreadyCompleted = currentCompleted.includes(taskId);

    const newCompletedIds = isAlreadyCompleted
      ? currentCompleted.filter(id => id !== taskId)
      : [...currentCompleted, taskId];

    // Audio feedback
    if (soundEnabled) {
      playSound(isAlreadyCompleted ? 'click' : 'complete', false);
    }

    // Calculate new metrics
    const deltaStats = calculateDailyScoreDelta(
      scheduledForDay,
      newCompletedIds,
      categoryMap,
      currentStreak,
      0
    );

    const prevBaseline = existingRec.creditScoreAfterCompletion - existingRec.scoreChange;
    const newCreditScore = Math.min(1000, Math.max(0, prevBaseline + deltaStats.delta));

    const completedSkills = tasks
      .filter(t => newCompletedIds.includes(t.id) && (t.categoryId === 'skills-study' || categoryMap[t.categoryId]?.isSkillCategory))
      .map(t => t.name.split(' (')[0]);

    const updatedRecord = {
      ...existingRec,
      scheduledTaskIds: scheduledForDay.map(t => t.id),
      completedTaskIds: newCompletedIds,
      completedSkills,
      dailyPoints: deltaStats.earnedPoints,
      completionPercentage: deltaStats.completionPercentage,
      scoreChange: deltaStats.delta,
      creditScoreAfterCompletion: newCreditScore,
      cumulativeProgressScore: newCreditScore,
    };

    // Optimistically update React State
    setDailyHistory(prev => ({
      ...prev,
      [targetDateISO]: updatedRecord,
    }));

    if (!isAlreadyCompleted && deltaStats.completionPercentage === 100 && scheduledForDay.length > 0) {
      setTimeout(() => {
        triggerCelebration('PERFECT DAY ACHIEVED! 🎯', 'All scheduled missions conquered. Cloud momentum locked in!', 'perfect_day');
      }, 150);
    }

    // Push to Supabase Cloud
    if (user) {
      setSyncStatus('syncing');
      try {
        if (isAlreadyCompleted) {
          await dailyRecordService.removeTaskCompletion(user.id, taskId, targetDateISO);
        } else {
          await dailyRecordService.recordTaskCompletion(user.id, taskId, targetDateISO);
        }

        await dailyRecordService.upsertDailyRecord(user.id, targetDateISO, {
          completionPercentage: deltaStats.completionPercentage,
          dailyPoints: deltaStats.earnedPoints,
          scoreChange: deltaStats.delta,
          creditScoreAfter: newCreditScore,
        });

        await scoreService.updateScore(user.id, newCreditScore, Math.max(newCreditScore, highestScore));
        await streakService.updateStreak(user.id, currentStreak, Math.max(currentStreak, cloudStreak.longest_streak || 0), targetDateISO);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Cloud task sync error:', err);
        setSyncStatus('error');
      }
    }
  }, [todayISO, tasks, categoryMap, currentStreak, currentCreditScore, highestScore, cloudStreak, user, soundEnabled, triggerCelebration, dailyHistory]);

  // Add Task (Cloud Synchronized)
  const addTask = useCallback(async (taskData) => {
    const newTask = {
      id: 'task-' + Date.now(),
      name: taskData.name.trim(),
      categoryId: taskData.categoryId || 'skills-study',
      points: Number(taskData.points) || 25,
      priority: taskData.priority || 'Medium',
      weeklyFrequency: Number(taskData.weeklyFrequency) || 5,
      specificDays: taskData.specificDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      createdAt: getTodayDateString(),
    };

    // Optimistic local state update
    setTasks(prev => [newTask, ...prev]);
    if (soundEnabled) playSound('click', false);

    // Save to Supabase Cloud
    if (user) {
      setSyncStatus('syncing');
      const { task: cloudCreated } = await taskService.createTask(user.id, newTask);
      if (cloudCreated) {
        setTasks(prev => prev.map(t => (t.id === newTask.id ? { ...t, id: cloudCreated.id } : t)));
      }
      setSyncStatus('synced');
    }
    return newTask;
  }, [user, soundEnabled]);

  // Update Task (Cloud Synchronized)
  const updateTask = useCallback(async (taskId, updatedData) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updatedData } : t))
    );
    if (soundEnabled) playSound('click', false);

    if (user) {
      setSyncStatus('syncing');
      await taskService.updateTask(taskId, updatedData);
      setSyncStatus('synced');
    }
  }, [user, soundEnabled]);

  // Delete Task (Cloud Synchronized)
  const deleteTask = useCallback(async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (soundEnabled) playSound('click', false);

    if (user) {
      setSyncStatus('syncing');
      await taskService.deleteTask(taskId);
      setSyncStatus('synced');
    }
  }, [user, soundEnabled]);

  // Add Category (Cloud Synchronized)
  const addCategory = useCallback(async (catData) => {
    const newCat = {
      id: 'cat-' + Date.now(),
      name: catData.name.trim(),
      icon: catData.icon || 'Folder',
      description: catData.description || '',
      importance: catData.importance || 'Medium Impact',
      multiplier: Number(catData.multiplier) || 1.0,
      isSkillCategory: Boolean(catData.isSkillCategory),
      color: catData.color || 'indigo',
    };

    setCategories(prev => [...prev, newCat]);
    if (soundEnabled) playSound('click', false);

    if (user) {
      setSyncStatus('syncing');
      const { category: created } = await categoryService.createCategory(user.id, newCat);
      if (created) {
        setCategories(prev => prev.map(c => (c.id === newCat.id ? { ...c, id: created.id } : c)));
      }
      setSyncStatus('synced');
    }
  }, [user, soundEnabled]);

  // Update Category
  const updateCategory = useCallback(async (catId, updatedData) => {
    setCategories(prev =>
      prev.map(c => (c.id === catId ? { ...c, ...updatedData } : c))
    );
    if (soundEnabled) playSound('click', false);

    if (user) {
      setSyncStatus('syncing');
      await categoryService.updateCategory(catId, updatedData);
      setSyncStatus('synced');
    }
  }, [user, soundEnabled]);

  // Delete Category
  const deleteCategory = useCallback(async (catId) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    setTasks(prev => prev.filter(t => t.categoryId !== catId));
    if (soundEnabled) playSound('click', false);

    if (user) {
      setSyncStatus('syncing');
      await categoryService.deleteCategory(catId);
      setSyncStatus('synced');
    }
  }, [user, soundEnabled]);

  // Reset to Defaults (or reseed demo)
  const resetToDefaults = useCallback(() => {
    const { history } = generateRealisticHistory(todayISO, DEFAULT_TASKS, DEFAULT_CATEGORIES);
    setCategories(DEFAULT_CATEGORIES);
    setTasks(DEFAULT_TASKS);
    setDailyHistory(history);
    setCloudScore({ current_score: 742, highest_score: 770 });
    setCloudStreak({ current_streak: 7, longest_streak: 14 });
    setSyncStatus('synced');
    if (soundEnabled) playSound('milestone', false);
  }, [todayISO, soundEnabled]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const value = {
    // Theme & Audio
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,

    // Cloud Sync
    syncStatus,

    // Dates
    todayISO,
    selectedDate,
    setSelectedDate,

    // Entities
    categories,
    tasks,
    categoryMap,
    dailyHistory,
    achievements,

    // Today's Computed
    todayScheduledTasks,
    todayRecord,
    todayCompletedCount,
    todayTotalCount,
    todayCompletionPct,
    todayPoints,
    scoreDeltaToday,
    isTodayPerfect,

    // Metrics
    currentCreditScore,
    currentStreak,
    highestScore,
    weeklyTaskProgressMap,

    // Actions
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,

    // Celebration
    celebration,
    triggerCelebration,
    dismissCelebration,
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return ctx;
}
