// Study Credit Score Engine (0 - 1000)

export const SCORE_TIERS = [
  { min: 850, max: 1000, label: 'Study Legend 🔥', color: 'from-amber-400 to-rose-500', badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40', dialColor: '#f59e0b' },
  { min: 700, max: 849, label: 'Excellent Progress', color: 'from-emerald-400 to-teal-500', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', dialColor: '#10b981' },
  { min: 500, max: 699, label: 'Good Progress', color: 'from-blue-400 to-indigo-500', badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40', dialColor: '#3b82f6' },
  { min: 300, max: 499, label: 'Getting Started', color: 'from-orange-400 to-amber-500', badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40', dialColor: '#f97316' },
  { min: 0, max: 299, label: 'Needs Improvement', color: 'from-rose-500 to-red-600', badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40', dialColor: '#ef4444' },
];

export function getScoreTier(score) {
  const clamped = Math.min(1000, Math.max(0, Math.round(score)));
  return SCORE_TIERS.find(t => clamped >= t.min && clamped <= t.max) || SCORE_TIERS[SCORE_TIERS.length - 1];
}

/**
 * Calculate the credit score change for a specific day given scheduled tasks and completions
 * 
 * @param {Array} scheduledTasks - Tasks scheduled for this day
 * @param {Array} completedTaskIds - Array of completed task IDs
 * @param {Object} categoryMap - Map of categoryId -> Category object
 * @param {number} currentStreak - Consecutive streak days up to this day
 * @param {number} consecutiveMissed - Consecutive days missed prior
 */
export function calculateDailyScoreDelta(
  scheduledTasks = [],
  completedTaskIds = [],
  categoryMap = {},
  currentStreak = 0,
  consecutiveMissed = 0
) {
  if (scheduledTasks.length === 0) {
    return { delta: 0, earnedPoints: 0, completionPercentage: 100, completedCount: 0, totalCount: 0 };
  }

  const completedSet = new Set(completedTaskIds);
  let totalWeightedMax = 0;
  let earnedWeightedPoints = 0;
  let earnedRawPoints = 0;
  let completedSkillsCount = 0;
  let totalSkillsScheduled = 0;

  scheduledTasks.forEach(task => {
    const cat = categoryMap[task.categoryId] || { multiplier: 1.0, isSkillCategory: false };
    const multiplier = Number(cat.multiplier) || 1.0;
    const taskPoints = Number(task.points) || 10;
    const weighted = taskPoints * multiplier;

    totalWeightedMax += weighted;

    if (cat.isSkillCategory || task.categoryId === 'skills-study') {
      totalSkillsScheduled++;
    }

    if (completedSet.has(task.id)) {
      earnedWeightedPoints += weighted;
      earnedRawPoints += taskPoints;
      if (cat.isSkillCategory || task.categoryId === 'skills-study') {
        completedSkillsCount++;
      }
    }
  });

  const completionPercentage = totalWeightedMax > 0 
    ? Math.round((earnedWeightedPoints / totalWeightedMax) * 100) 
    : 0;

  // Base delta based on completion percentage:
  // 100%: +28 to +35
  // 75-99%: +18 to +25
  // 50-74%: +8 to +15
  // 25-49%: 0 to +5
  // 1-24%: -5
  // 0%: -15 to -25 (penalized for inactive day)
  let delta = 0;

  if (completionPercentage === 100) {
    delta = 30;
    // Perfect day skill bonus
    if (completedSkillsCount > 0) {
      delta += Math.min(8, completedSkillsCount * 2);
    }
  } else if (completionPercentage >= 75) {
    delta = 20;
  } else if (completionPercentage >= 50) {
    delta = 10;
  } else if (completionPercentage >= 25) {
    delta = 2;
  } else if (completionPercentage > 0) {
    delta = -5;
  } else {
    // 0% completion on a scheduled day
    delta = -15 - Math.min(10, consecutiveMissed * 3);
  }

  // Streak bonus: up to +8 bonus points
  if (currentStreak >= 3 && completionPercentage >= 50) {
    const streakBonus = Math.min(8, Math.floor(currentStreak / 3) * 2);
    delta += streakBonus;
  }

  return {
    delta,
    earnedPoints: earnedRawPoints,
    completionPercentage,
    completedCount: completedSet.size,
    totalCount: scheduledTasks.length,
    completedSkillsCount,
    totalSkillsScheduled,
  };
}
