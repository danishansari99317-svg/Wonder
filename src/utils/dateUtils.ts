/**
 * Formats an ISO date string or Date object into Indian Standard Time (IST) format
 * Example output: "15 Sep 2026, 07:45 PM IST"
 */
export function formatISTDateTime(dateInput?: string | Date | number): string {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const formatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${formatted} IST`;
}

/**
 * Formats a date with relative day indicator in IST
 */
export function formatISTRelative(dateInput?: string | Date | number): string {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const timeStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  const dateStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

  const nowDateStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);

  if (dateStr === nowDateStr) {
    return `Today at ${timeStr} IST`;
  }

  return `${dateStr}, ${timeStr} IST`;
}
