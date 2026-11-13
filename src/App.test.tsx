import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

function startRoundAndReachPlayerInput() {
  act(() => {
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
  });

  act(() => {
    vi.advanceTimersByTime(3000);
  });

  act(() => {
    vi.advanceTimersByTime(6000);
  });
}

describe('application journeys', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the home screen and starts a new game', () => {
    render(<App />);

    expect(screen.getByRole('img', { name: /mini memory game logo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /how to play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /app information/i })).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }));
    });

    expect(screen.getByText('3')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('2')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /back to home/i }));
    });

    expect(screen.getByRole('img', { name: /mini memory game logo/i })).toBeInTheDocument();
  });

  it('keeps the game view for one second before showing the final score', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }));
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /select triangle/i }));
    });

    expect(screen.queryByRole('heading', { name: /game over/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select circle/i })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(999);
    });

    expect(screen.queryByRole('heading', { name: /game over/i })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByRole('heading', { name: /game over/i })).toBeInTheDocument();
  });

  it('opens settings with interactive visual controls and reset confirmation', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Leaderboard' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Profile' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Background music' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Sound effects' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Haptic feedback' })).toBeChecked();
    expect(screen.getByRole('slider', { name: 'Music volume' })).toHaveValue('30');
    expect(screen.getByRole('slider', { name: 'Sound volume' })).toHaveValue('70');

    fireEvent.click(screen.getByRole('switch', { name: 'Background music' }));
    expect(screen.getByRole('switch', { name: 'Background music' })).not.toBeChecked();

    fireEvent.change(screen.getByRole('slider', { name: 'Music volume' }), {
      target: { value: '45' },
    });
    expect(screen.getByText('45%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Reset$/ }));
    expect(screen.getByRole('dialog', { name: 'Reset personal records?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Reset$/ }));
    const resetDialog = screen.getByRole('dialog', { name: 'Reset personal records?' });
    fireEvent.click(within(resetDialog).getByRole('button', { name: 'Reset' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(screen.getByRole('img', { name: /mini memory game logo/i })).toBeInTheDocument();
  });

  it('plays countdown, shape, timer, and wrong-answer sounds at the expected phases', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const playedSources: string[] = [];

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      playedSources.push(this.src);
      return Promise.resolve();
    });

    render(<App />);
    startRoundAndReachPlayerInput();

    expect(playedSources.filter((source) => source.includes('beep.mp3'))).toHaveLength(3);
    expect(playedSources.filter((source) => source.includes('pop.mp3'))).toHaveLength(3);
    expect(
      playedSources.filter((source) => source.includes('countdown-10s.mp3')),
    ).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Select Triangle' }));
    expect(playedSources.filter((source) => source.includes('wrong.mp3'))).toHaveLength(1);
  });

  it('plays the bell once when a round is completed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const playedSources: string[] = [];

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      playedSources.push(this.src);
      return Promise.resolve();
    });

    render(<App />);
    startRoundAndReachPlayerInput();

    fireEvent.click(screen.getByRole('button', { name: 'Select Circle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Square' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Circle' }));

    expect(screen.getByText('Round cleared')).toBeInTheDocument();
    expect(playedSources.filter((source) => source.includes('bell.mp3'))).toHaveLength(1);
  });
});
