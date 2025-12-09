// Example method, has no actual meaning
export function trim(str: string) {
  return str.trim();
}

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
  if (!a) return 1; // undefined goes last on ASC
  if (!b) return -1;
  return new Date(a).getTime() - new Date(b).getTime();
};

/**
 * Format a date string to a localized date-time string
 * @param v Date string (optional)
 * @returns Formatted date-time string or '—' if not provided
 */
export const formatDateTime = (v?: string): string =>
  v
    ? new Date(v).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // Force 24-hour (military) time format
        hour12: false,
        hourCycle: 'h23',
      })
    : '—';
