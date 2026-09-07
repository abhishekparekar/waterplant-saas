/**
 * Format ISO Date string to human readable format (e.g., Aug 25, 2026)
 */
export const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format ISO Date string with time (e.g., Aug 25, 2026, 2:30 PM)
 */
export const formatDateTime = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get current ISO string
 */
export const getNowISO = (): string => new Date().toISOString();
