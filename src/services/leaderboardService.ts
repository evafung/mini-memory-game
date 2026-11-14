export const LEADERBOARD_STORAGE_KEY = 'mini-memory-game:leaderboard:v1';
export const LEADERBOARD_LIMIT = 10;

export interface LeaderboardEntry {
  id: string;
  score: number;
  date: string;
}

interface LeaderboardValidationResult {
  entries: LeaderboardEntry[];
  valid: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidTimestamp(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    Number.isFinite(Date.parse(value)) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function compareEntries(first: LeaderboardEntry, second: LeaderboardEntry): number {
  return second.score - first.score || Date.parse(second.date) - Date.parse(first.date);
}

export function sortLeaderboardEntries(
  entries: readonly LeaderboardEntry[],
): LeaderboardEntry[] {
  return [...entries].sort(compareEntries).slice(0, LEADERBOARD_LIMIT);
}

function normalizeLeaderboard(value: unknown): LeaderboardValidationResult {
  if (!isRecord(value) || !Array.isArray(value.entries)) {
    return { entries: [], valid: false };
  }

  let valid = true;
  const entries = value.entries.flatMap((entry): LeaderboardEntry[] => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== 'string' ||
      entry.id.length === 0 ||
      typeof entry.score !== 'number' ||
      !Number.isFinite(entry.score) ||
      entry.score < 0 ||
      !isValidTimestamp(entry.date)
    ) {
      valid = false;
      return [];
    }

    return [{ id: entry.id, score: entry.score, date: entry.date }];
  });

  return { entries: sortLeaderboardEntries(entries), valid };
}

export function validateLeaderboard(value: unknown): LeaderboardEntry[] {
  return normalizeLeaderboard(value).entries;
}

function createEntryId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to a non-cryptographic local identifier.
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function saveLeaderboard(entries: readonly LeaderboardEntry[]): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      LEADERBOARD_STORAGE_KEY,
      JSON.stringify({ entries: sortLeaderboardEntries(entries) }),
    );
  } catch (error) {
    console.warn('Unable to save the personal leaderboard.', error);
  }
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    if (typeof window === 'undefined') {
      return [];
    }

    const storedLeaderboard = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (storedLeaderboard === null) {
      return [];
    }

    const parsedLeaderboard: unknown = JSON.parse(storedLeaderboard);
    const result = normalizeLeaderboard(parsedLeaderboard);
    if (!result.valid) {
      console.warn('Saved leaderboard data contains invalid entries.');
    }
    return result.entries;
  } catch (error) {
    console.warn('Unable to load the personal leaderboard.', error);
    return [];
  }
}

export function recordCompletedGame(score: number): LeaderboardEntry[] {
  if (!Number.isFinite(score) || score < 0) {
    console.warn('Cannot save an invalid game score.');
    return loadLeaderboard();
  }

  const newEntry: LeaderboardEntry = {
    id: createEntryId(),
    score,
    date: new Date().toISOString(),
  };
  const entries = sortLeaderboardEntries([...loadLeaderboard(), newEntry]);
  saveLeaderboard(entries);
  return entries;
}

export function clearLeaderboard(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Unable to clear the personal leaderboard.', error);
  }
}
