// Initial Data Seeding for Study Tracker Dashboard
import { getISODate, parseISODate, isTaskScheduledForDay, DAYS_OF_WEEK } from '../utils/dateUtils';
import { calculateDailyScoreDelta } from '../utils/scoringEngine';

export const DEFAULT_CATEGORIES = [
  {
    id: 'skills-study',
    name: 'Skills & Study',
    icon: 'Rocket',
    description: 'High-leverage academic & career-defining skills. Maximum credit impact.',
    importance: 'High Impact',
    multiplier: 2.2,
    isSkillCategory: true,
    color: 'indigo',
  },
  {
    id: 'daily-routine',
    name: 'Daily Routine',
    icon: 'Sun',
    description: 'Foundational morning/evening discipline habits and biological health.',
    importance: 'Low Impact',
    multiplier: 0.3,
    isSkillCategory: false,
    color: 'amber',
  },
  {
    id: 'fitness',
    name: 'Fitness & Health',
    icon: 'Dumbbell',
    description: 'Physical strength, workouts, hydration, and energy management.',
    importance: 'Medium Impact',
    multiplier: 1.2,
    isSkillCategory: false,
    color: 'emerald',
  },
  {
    id: 'reading-growth',
    name: 'Reading & Intellect',
    icon: 'BookOpen',
    description: 'Engineering papers, deep reading, and mental models.',
    importance: 'Medium Impact',
    multiplier: 1.1,
    isSkillCategory: false,
    color: 'purple',
  },
];

export const DEFAULT_TASKS = [
  // Skills & Study (High points: 30 - 50)
  {
    id: 'task-dsa',
    name: 'DSA & Algorithms (LeetCode / NeetCode)',
    categoryId: 'skills-study',
    points: 40,
    priority: 'High',
    weeklyFrequency: 5,
    specificDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
    linkUrl: 'https://leetcode.com/u/gopalsarkar/',
    createdAt: '2026-08-01',
  },
  {
    id: 'task-webdev',
    name: 'Full-Stack Web Dev (React & System Architecture)',
    categoryId: 'skills-study',
    points: 35,
    priority: 'High',
    weeklyFrequency: 5,
    specificDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sun'],
    linkUrl: 'https://classroom.sheryians.com/',
    createdAt: '2026-08-01',
  },
  {
    id: 'task-math',
    name: 'Mathematics & Discrete Structures',
    categoryId: 'skills-study',
    points: 35,
    priority: 'Medium',
    weeklyFrequency: 3,
    specificDays: ['Tue', 'Thu', 'Sat'],
    linkUrl: 'https://www.youtube.com/results?search_query=discrete+mathematics+for+computer+science',
    createdAt: '2026-08-01',
  },
  {
    id: 'task-system-design',
    name: 'System Design & Distributed Scalability',
    categoryId: 'skills-study',
    points: 45,
    priority: 'High',
    weeklyFrequency: 3,
    specificDays: ['Wed', 'Sat', 'Sun'],
    linkUrl: 'https://github.com/donnemartin/system-design-primer',
    createdAt: '2026-08-01',
  },
  {
    id: 'task-dbms',
    name: 'Core CS: DBMS Queries & Indexing',
    categoryId: 'skills-study',
    points: 30,
    priority: 'Medium',
    weeklyFrequency: 3,
    specificDays: ['Mon', 'Wed', 'Fri'],
    linkUrl: 'https://www.youtube.com/results?search_query=dbms+complete+course+gate',
    createdAt: '2026-08-01',
  },

  // Daily Routine (Low points: 2 - 8)
  {
    id: 'task-wake-early',
    name: 'Wake Up at 6:00 AM',
    categoryId: 'daily-routine',
    points: 5,
    priority: 'Medium',
    weeklyFrequency: 7,
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    createdAt: '2026-08-01',
  },
  {
    id: 'task-morning-hydrate',
    name: 'Morning Hydration (1L) & Cold Splash',
    categoryId: 'daily-routine',
    points: 3,
    priority: 'Low',
    weeklyFrequency: 7,
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    createdAt: '2026-08-01',
  },
  {
    id: 'task-workspace-clean',
    name: 'Workspace Reset & Deep Focus Prep',
    categoryId: 'daily-routine',
    points: 4,
    priority: 'Low',
    weeklyFrequency: 6,
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    createdAt: '2026-08-01',
  },
  {
    id: 'task-night-plan',
    name: 'Evening Review & Next-Day Blueprint',
    categoryId: 'daily-routine',
    points: 6,
    priority: 'Medium',
    weeklyFrequency: 7,
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    createdAt: '2026-08-01',
  },

  // Fitness & Health (Medium: 10 - 15)
  {
    id: 'task-workout',
    name: '45-Min Calisthenics / Strength Session',
    categoryId: 'fitness',
    points: 15,
    priority: 'Medium',
    weeklyFrequency: 4,
    specificDays: ['Mon', 'Wed', 'Fri', 'Sun'],
    createdAt: '2026-08-01',
  },
  {
    id: 'task-walk',
    name: '10,000 Steps Outdoor Walk',
    categoryId: 'fitness',
    points: 10,
    priority: 'Low',
    weeklyFrequency: 6,
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat', 'Sun'],
    createdAt: '2026-08-01',
  },

  // Reading & Intellect (Medium: 12 - 18)
  {
    id: 'task-deep-read',
    name: 'Read 20 Pages of Engineering / Philosophy',
    categoryId: 'reading-growth',
    points: 15,
    priority: 'Medium',
    weeklyFrequency: 5,
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    createdAt: '2026-08-01',
  },
];

/**
 * Generate 30 days of realistic history leading up to target date
 */
export function generateRealisticHistory(todayDateStr, tasks = DEFAULT_TASKS, categories = DEFAULT_CATEGORIES) {
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.id] = c; });

  const history = {};
  const targetDate = parseISODate(todayDateStr);

  let currentScore = 520; // Starting credit score 30 days ago
  let runningStreak = 0;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - i);
    const iso = getISODate(d);
    const isToday = i === 0;

    // Get tasks scheduled for this day
    const scheduled = tasks.filter(t => isTaskScheduledForDay(t, iso));

    let completedIds = [];

    if (isToday) {
      // For today: 3 tasks already completed (DSA, Wake up, Morning Hydrate)
      completedIds = ['task-dsa', 'task-wake-early', 'task-morning-hydrate'].filter(id =>
        scheduled.some(s => s.id === id)
      );
    } else {
      // Historical completion patterns:
      // i = 1 to 7 (Last 7 days): Consistent strong streak! (75% to 100%)
      // i = 8: Missed day (0% or low completion) to show realistic resilience
      // i = 9 to 29: Good progress with varied completion
      if (i <= 7) {
        // High performance days in the active 7-day streak
        if (i === 1 || i === 4 || i === 6) {
          // 100% completion (Perfect days!)
          completedIds = scheduled.map(t => t.id);
        } else {
          // 75%-85% completion
          completedIds = scheduled.filter((_, idx) => idx % 4 !== 0).map(t => t.id);
        }
      } else if (i === 8) {
        // Missed day 8 days ago
        completedIds = [];
      } else if (i === 14 || i === 22) {
        // Light day
        completedIds = scheduled.slice(0, 1).map(t => t.id);
      } else {
        // General consistent study
        completedIds = scheduled.filter((_, idx) => idx % 3 !== 1).map(t => t.id);
      }
    }

    // Calculate delta and stats
    const deltaStats = calculateDailyScoreDelta(
      scheduled,
      completedIds,
      categoryMap,
      runningStreak,
      0
    );

    if (deltaStats.completionPercentage >= 50) {
      runningStreak++;
    } else if (i !== 0) {
      runningStreak = 0;
    }

    currentScore = Math.min(1000, Math.max(0, currentScore + deltaStats.delta));

    // Completed skill subjects list
    const completedSkills = tasks
      .filter(t => completedIds.includes(t.id) && t.categoryId === 'skills-study')
      .map(t => t.name.split(' (')[0]);

    history[iso] = {
      date: iso,
      scheduledTaskIds: scheduled.map(t => t.id),
      completedTaskIds: completedIds,
      completedSkills,
      dailyPoints: deltaStats.earnedPoints,
      completionPercentage: deltaStats.completionPercentage,
      scoreChange: deltaStats.delta,
      creditScoreAfterCompletion: currentScore,
      cumulativeProgressScore: currentScore,
    };
  }

  return { history, finalScore: currentScore, streak: 7 };
}

export const DEFAULT_VISION_PHOTOS = [
  {
    id: 'vision-1',
    title: 'Top Tier Software Engineer Dream',
    caption: 'One year of relentless focus and consistency will change your entire life. Never give up!',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    tag: 'Future Goal 🚀',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vision-2',
    title: 'Deep Late-Night Algorithmic Mastery',
    caption: 'Solve the hard problems in silence. Your results will roar louder than words.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    tag: 'LeetCode & DSA 🧠',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vision-3',
    title: 'Dream Minimalist Coding Setup',
    caption: 'Clean code, dual displays, zero distractions. The summit belongs to the disciplined.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tag: 'Dream Setup 💻',
    createdAt: new Date().toISOString(),
  },
];
