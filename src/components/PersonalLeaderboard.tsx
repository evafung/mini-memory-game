import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '../services/leaderboardService';
import { formatRelativeTime } from './formatRelativeTime';
import PageHeader from './PageHeader';

export default function PersonalLeaderboard({
  entries,
  onBack,
}: {
  entries: readonly LeaderboardEntry[];
  onBack: () => void;
}) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (entries.length === 0) {
      return undefined;
    }

    const refreshTime = () => setNow(Date.now());
    const intervalId = window.setInterval(refreshTime, 60_000);
    document.addEventListener('visibilitychange', refreshTime);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshTime);
    };
  }, [entries.length]);

  return (
    <main className="settings-page leaderboard-page">
      <PageHeader title="Leaderboard" onBack={onBack} />
      <div
        className="settings-page__content leaderboard-page__content"
        role="region"
        aria-label="Leaderboard scores"
        tabIndex={0}
      >
        {entries.length === 0 ? (
          <div className="leaderboard-empty" role="status">
            <h2>No scores yet</h2>
            <p>Complete a game to add your first score to the leaderboard.</p>
          </div>
        ) : (
          <ol className="leaderboard-list" aria-label="Personal leaderboard">
            {entries.map((entry, index) => {
              const rank = index + 1;
              return (
                <li
                  className={`leaderboard-entry${rank <= 3 ? ` leaderboard-entry--top-${rank}` : ''}`}
                  key={entry.id}
                >
                  <span
                    className={`leaderboard-entry__rank${rank <= 3 ? ` leaderboard-entry__rank--top-${rank}` : ''}`}
                    aria-label={`Rank ${rank}`}
                  >
                    {rank}
                  </span>
                  <strong className="leaderboard-entry__score">{entry.score}</strong>
                  <time className="leaderboard-entry__date" dateTime={entry.date}>
                    {formatRelativeTime(entry.date, now)}
                  </time>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
