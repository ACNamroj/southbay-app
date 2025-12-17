// Example method, has no actual meaning
export function trim(str: string) {
  return str.trim();
}

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const parseDate = (v?: string) => {
  if (!v) return dayjs('');
  // Try strict parse for common backend formats, fallback to dayjs default
  const d1 = dayjs(v, 'YYYY-MM-DD HH:mm:ss', true);
  if (d1.isValid()) return d1;
  const d2 = dayjs(v, 'YYYY-MM-DDTHH:mm:ss', true);
  if (d2.isValid()) return d2;
  return dayjs(v);
};

/**
 * Compare two strings for sorting purposes
 * @param a First string (optional)
 * @param b Second string (optional)
 * @returns Comparison result for sorting
 */
export const compareStrings = (a?: string, b?: string): number => {
  return (a || '').localeCompare(b || '');
};

/**
 * Compare two date strings for sorting purposes
 * @param a First date string (optional)
 * @param b Second date string (optional)
 * @returns Comparison result for sorting (undefined values go last on ascending)
 */
export const compareDates = (a?: string, b?: string): number => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const da = parseDate(a);
  const db = parseDate(b);
  const av = da.isValid() ? da.valueOf() : Number.POSITIVE_INFINITY;
  const bv = db.isValid() ? db.valueOf() : Number.POSITIVE_INFINITY;
  return av - bv;
};

/**
 * Format a date string to a localized date-time string
 * @param v Date string (optional)
 * @returns Formatted date-time string or '—' if not provided
 */
export const formatDateTime = (v?: string): string => {
  if (!v) return '—';
  const d = parseDate(v);
  if (!d.isValid()) return '—';
  return new Date(d.valueOf()).toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    // Force 24-hour (military) time format
    hour12: false,
    hourCycle: 'h23',
  });
};
