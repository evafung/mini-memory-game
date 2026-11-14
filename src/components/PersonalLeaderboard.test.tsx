import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PersonalLeaderboard from './PersonalLeaderboard';
import { formatRelativeTime } from './formatRelativeTime';
import type { LeaderboardEntry } from '../services/leaderboardService';

const now = Date.parse('2026-11-14T20:00:00.000Z');

describe('leaderboard relative time', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [0, '< 1 minute ago'],
    [59, '< 1 minute ago'],
    [60, '1 minute ago'],
    [119, '1 minute ago'],
    [120, '2 minutes ago'],
    [59 * 60, '59 minutes ago'],
    [60 * 60, '1 hour ago'],
    [119 * 60, '1 hour ago'],
    [120 * 60, '2 hours ago'],
    [23 * 60 * 60, '23 hours ago'],
    [24 * 60 * 60, 'Yesterday'],
    [47 * 60 * 60, 'Yesterday'],
    [48 * 60 * 60, '2 days ago'],
    [71 * 60 * 60, '2 days ago'],
    [72 * 60 * 60, '3 days ago'],
    [96 * 60 * 60, '4 days ago'],
  ])('formats %s seconds elapsed', (elapsedSeconds, expected) => {
    const timestamp = new Date(now - elapsedSeconds * 1000).toISOString();
    expect(formatRelativeTime(timestamp, now)).toBe(expected);
  });

  it('handles invalid and future timestamps safely', () => {
    expect(formatRelativeTime('not-a-timestamp', now)).toBe('Unknown time');
    expect(formatRelativeTime(new Date(now + 60_000).toISOString(), now)).toBe(
      '< 1 minute ago',
    );

    render(
      <PersonalLeaderboard
        entries={[{ id: 'invalid', score: 100, date: 'not-a-timestamp' }]}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByText('Unknown time')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Invalid Date/)).not.toBeInTheDocument();
  });

  it('updates labels periodically and when visibility changes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const entry: LeaderboardEntry = {
      id: 'recent',
      score: 100,
      date: new Date(now).toISOString(),
    };
    render(<PersonalLeaderboard entries={[entry]} onBack={vi.fn()} />);

    expect(screen.getByText('< 1 minute ago')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('1 minute ago')).toBeInTheDocument();

    vi.setSystemTime(now + 120_000);
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(screen.getByText('2 minutes ago')).toBeInTheDocument();
  });
});
