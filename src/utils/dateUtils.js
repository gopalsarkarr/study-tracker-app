// Date utility functions for Study Tracker

export const DAYS_OF_WEEK = [
  { key: 'Sun', label: 'Sunday', index: 0 },
  { key: 'Mon', label: 'Monday', index: 1 },
  { key: 'Tue', label: 'Tuesday', index: 2 },
  { key: 'Wed', label: 'Wednesday', index: 3 },
  { key: 'Thu', label: 'Thursday', index: 4 },
  { key: 'Fri', label: 'Friday', index: 5 },
  { key: 'Sat', label: 'Saturday', index: 6 },
];

/**
 * Returns ISO date string YYYY-MM-DD
 */
export function getISODate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current system/app today's date
 */
export function getTodayDateString() {
  return getISODate(new Date());
}

/**
 * Parse YYYY-MM-DD into a Date object safely
 */
export function parseISODate(isoString) {
  if (!isoString) return new Date();
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a date string for display (e.g. "Tuesday, September 8, 2026")
 */
export function formatFullDate(isoString) {
  const d = parseISODate(isoString);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date string for short display (e.g. "Sep 8")
 */
export function formatShortDate(isoString) {
  const d = parseISODate(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get weekday short code ('Mon', 'Tue', etc.)
 */
export function getWeekdayShort(isoString) {
  const d = parseISODate(isoString);
  const dayIndex = d.getDay();
  return DAYS_OF_WEEK[dayIndex].key;
}

/**
 * Checks if a task is scheduled for a given day
 * @param {Object} task
 * @param {string} isoDate
 */
export function isTaskScheduledForDay(task, isoDate) {
  const weekday = getWeekdayShort(isoDate);
  // If specificDays array is provided and not empty
  if (task.specificDays && Array.isArray(task.specificDays) && task.specificDays.length > 0) {
    return task.specificDays.includes(weekday);
  }
  // Otherwise if frequency is 7 days, it's every day
  if (task.weeklyFrequency === 7 || !task.weeklyFrequency) {
    return true;
  }
  // If weekly frequency is N days but no specific days chosen, default to Mon-Fri for 5, etc.
  const defaultWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, task.weeklyFrequency);
  return defaultWeekdays.includes(weekday);
}

/**
 * Get array of dates for a calendar month grid (including padding from adjacent months)
 */
export function getMonthCalendarGrid(year, monthIndex) {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const grid = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, monthIndex - 1, prevMonthLastDay - i);
    grid.push({
      date: getISODate(d),
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, monthIndex, i);
    grid.push({
      date: getISODate(d),
      dayNumber: i,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
    });
  }

  // Next month padding to fill complete weeks (up to 35 or 42 cells)
  const remaining = (7 - (grid.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, monthIndex + 1, i);
    grid.push({
      date: getISODate(d),
      dayNumber: i,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true,
    });
  }

  return grid;
}

/**
 * Get past 30 days up to a target date (inclusive)
 */
export function getLast30Days(targetDate = new Date()) {
  const dates = [];
  const curr = new Date(targetDate);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(curr);
    d.setDate(d.getDate() - i);
    dates.push(getISODate(d));
  }
  return dates;
}

/**
 * Calculate current streak from daily history
 * A day is counted in streak if completed tasks >= 1 and completion >= 50% or all scheduled completed
 */
export function calculateStreak(dailyHistory, todayISO) {
  let streak = 0;
  let checkDate = new Date(parseISODate(todayISO));

  // First check if today has activity
  const todayRecord = dailyHistory[todayISO];
  const todayActive = todayRecord && (todayRecord.completedTaskIds?.length > 0 || todayRecord.completionPercentage >= 50);

  if (todayActive) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If today is not yet done, we check yesterday to see if current streak is still alive
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const iso = getISODate(checkDate);
    const rec = dailyHistory[iso];
    if (rec && (rec.completedTaskIds?.length > 0 && rec.completionPercentage >= 30)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get current week start (Monday) and end (Sunday) dates
 */
export function getCurrentWeekRange(referenceDate = new Date()) {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diffToMon));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(getISODate(nextDay));
  }
  return days;
}
