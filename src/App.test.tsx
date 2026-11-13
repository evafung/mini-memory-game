import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

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
});
