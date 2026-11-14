export function formatRelativeTime(value: string, now = Date.now()): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return 'Unknown time';
  }

  const elapsedSeconds = Math.floor(Math.max(0, now - timestamp) / 1000);
  if (elapsedSeconds < 60) {
    return '< 1 minute ago';
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 2) {
    return '1 minute ago';
  }
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minutes ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 2) {
    return '1 hour ago';
  }
  if (elapsedHours < 24) {
    return `${elapsedHours} hours ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays === 1) {
    return 'Yesterday';
  }
  return `${elapsedDays} days ago`;
}
