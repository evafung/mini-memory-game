import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearLeaderboard,
  LEADERBOARD_LIMIT,
  LEADERBOARD_STORAGE_KEY,
  loadLeaderboard,
  recordCompletedGame,
  sortLeaderboardEntries,
  validateLeaderboard,
  type LeaderboardEntry,
} from './leaderboardService';

function entry(id: string, score: number, date: string): LeaderboardEntry {
  return { id, score, date };
}

describe('leaderboard service', () => {
  beforeEach(() => {
    window.localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sorts scores descending and puts newer equal scores first', () => {
    expect(
      sortLeaderboardEntries([
        entry('older-tie', 100, '2026-11-12T10:00:00.000Z'),
        entry('lower', 90, '2026-11-14T10:00:00.000Z'),
        entry('newer-tie', 100, '2026-11-13T10:00:00.000Z'),
      ]).map(({ id }) => id),
    ).toEqual(['newer-tie', 'older-tie', 'lower']);
  });

  it('ignores malformed entries and keeps only valid top scores', () => {
    const stored = {
      entries: [
        entry('valid-low', 1, '2026-11-12T10:00:00.000Z'),
        { id: 'negative', score: -1, date: '2026-11-13T10:00:00.000Z' },
        { id: 'invalid-score', score: Infinity, date: '2026-11-13T10:00:00.000Z' },
        { id: 'invalid-date', score: 100, date: 'not-a-date' },
        ...Array.from({ length: 12 }, (_, index) =>
          entry(`score-${index}`, index + 2, '2026-11-14T10:00:00.000Z'),
        ),
      ],
    };

    const validated = validateLeaderboard(stored);
    expect(validated).toHaveLength(LEADERBOARD_LIMIT);
    expect(validated[0].score).toBe(13);
    expect(validated.at(-1)?.score).toBe(4);
    expect(validated.some(({ id }) => id === 'negative')).toBe(false);
  });

  it('persists new records and discards scores outside the top ten', () => {
    const initialEntries = Array.from({ length: LEADERBOARD_LIMIT }, (_, index) =>
      entry(`existing-${index}`, 100 - index, '2026-11-14T10:00:00.000Z'),
    );
    window.localStorage.setItem(
      LEADERBOARD_STORAGE_KEY,
      JSON.stringify({ entries: initialEntries }),
    );

    const unchanged = recordCompletedGame(1);
    expect(unchanged).toHaveLength(LEADERBOARD_LIMIT);
    expect(unchanged.some(({ score }) => score === 1)).toBe(false);

    const updated = recordCompletedGame(200);
    expect(updated).toHaveLength(LEADERBOARD_LIMIT);
    expect(updated[0].score).toBe(200);
    expect(loadLeaderboard()).toEqual(updated);
  });

  it('clears only leaderboard storage', () => {
    window.localStorage.setItem(
      LEADERBOARD_STORAGE_KEY,
      JSON.stringify({ entries: [entry('one', 5, '2026-11-14T10:00:00.000Z')] }),
    );
    window.localStorage.setItem('mini-memory-game:settings:v1', '{"darkMode":true}');

    clearLeaderboard();

    expect(loadLeaderboard()).toEqual([]);
    expect(window.localStorage.getItem('mini-memory-game:settings:v1')).toBe(
      '{"darkMode":true}',
    );
  });

  it('handles malformed and unavailable storage without throwing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, '{bad json');
    expect(loadLeaderboard()).toEqual([]);

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    expect(loadLeaderboard()).toEqual([]);
    expect(() => clearLeaderboard()).not.toThrow();
  });

  it('keeps the game usable when saving a completed score fails', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    expect(() => recordCompletedGame(10)).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith(
      'Unable to save the personal leaderboard.',
      expect.any(Error),
    );
  });
});
