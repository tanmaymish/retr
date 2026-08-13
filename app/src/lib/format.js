const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const DATE_TIME = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : DATE.format(date);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : DATE_TIME.format(date);
}

/** "2 hours ago", "Yesterday" — the way the activity log reads. */
export function relativeTime(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.round((Date.now() - then) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86_400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(seconds / 86_400);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(value);
}

/** Groups activity entries under Today / Yesterday / a date. */
export function dayLabel(value) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  const same = (a, b) => a.toDateString() === b.toDateString();

  if (same(date, today)) return 'Today';
  if (same(date, yesterday)) return 'Yesterday';
  return formatDate(value);
}

export function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name) {
  return String(name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function relationshipLabel(value) {
  return String(value ?? '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

/** Days/hours/minutes for the emergency countdown. */
export function countdownParts(msRemaining) {
  const ms = Math.max(0, msRemaining ?? 0);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
  };
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Rupees, in the Indian numbering system.
 *
 * Lakhs and crores, never millions — a number written the way a reader here
 * actually says it out loud. `compact` gives the short form used on headline
 * figures; the full form keeps the grouping (12,34,567) that `en-IN` applies.
 */
export function formatMoney(value, { compact = false } = {}) {
  const n = Math.round(Number(value) || 0);
  if (!compact) return `₹${n.toLocaleString('en-IN')}`;

  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${trim(n / 10000000)} Cr`;
  if (abs >= 100000) return `₹${trim(n / 100000)} L`;
  if (abs >= 1000) return `₹${trim(n / 1000)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function trim(value) {
  return Number(value.toFixed(2)).toLocaleString('en-IN');
}
