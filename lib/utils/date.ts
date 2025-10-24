import { startOfWeek, format } from 'date-fns';

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Format a date as ISO date string (YYYY-MM-DD)
 */
export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get the week start date as ISO string
 */
export function getWeekStartISO(date: Date = new Date()): string {
  return formatISODate(getWeekStart(date));
}
