import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import {
  createDefaultSettings,
  SETTINGS_STORAGE_KEY,
} from './services/settingsService';
import { LEADERBOARD_STORAGE_KEY } from './services/leaderboardService';

const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
const originalVibrateDescriptor = Object.getOwnPropertyDescriptor(navigator, 'vibrate');

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
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.localStorage.clear();
    if (originalMatchMediaDescriptor) {
      Object.defineProperty(window, 'matchMedia', originalMatchMediaDescriptor);
    } else {
      Reflect.deleteProperty(window, 'matchMedia');
    }
    if (originalVibrateDescriptor) {
      Object.defineProperty(navigator, 'vibrate', originalVibrateDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'vibrate');
    }
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

    expect(screen.getByRole('button', { name: 'Leaderboard' })).toBeEnabled();
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
    const savedSettingsBeforeReset = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    window.localStorage.setItem(
      LEADERBOARD_STORAGE_KEY,
      JSON.stringify({
        entries: [{ id: 'existing-score', score: 100, date: '2026-11-14T10:00:00.000Z' }],
      }),
    );
    fireEvent.click(within(resetDialog).getByRole('button', { name: 'Reset' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).toBe(savedSettingsBeforeReset);
    expect(window.localStorage.getItem(LEADERBOARD_STORAGE_KEY)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(screen.getByRole('img', { name: /mini memory game logo/i })).toBeInTheDocument();
  });

  it('opens the empty leaderboard with the shared sticky page header', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Leaderboard' }));

    const header = screen.getByRole('heading', { name: 'Leaderboard' }).closest(
      '.settings-header',
    );
    const content = screen.getByRole('region', { name: 'Leaderboard scores' });
    expect(header?.parentElement).toHaveClass('settings-page');
    expect(content).toHaveClass('settings-page__content');
    expect(content).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('status')).toHaveTextContent('No scores yet');
    expect(
      screen.getByText('Complete a game to add your first score to the leaderboard.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(screen.getByRole('img', { name: /mini memory game logo/i })).toBeInTheDocument();
  });

  it('renders saved leaderboard entries with rank colours and only score and date', () => {
    window.localStorage.setItem(
      LEADERBOARD_STORAGE_KEY,
      JSON.stringify({
        entries: [
          { id: 'second', score: 90, date: '2026-11-13T10:00:00.000Z' },
          { id: 'first', score: 120, date: '2026-11-14T10:00:00.000Z' },
          { id: 'third', score: 80, date: '2026-11-12T10:00:00.000Z' },
          { id: 'fourth', score: 70, date: '2026-11-11T10:00:00.000Z' },
        ],
      }),
    );
    vi.setSystemTime(new Date('2026-11-14T10:00:00.000Z'));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Leaderboard' }));
    const entries = screen.getByRole('list', { name: 'Personal leaderboard' }).children;
    expect(entries).toHaveLength(4);
    expect(entries[0]).toHaveClass('leaderboard-entry--top-1');
    expect(entries[1]).toHaveClass('leaderboard-entry--top-2');
    expect(entries[2]).toHaveClass('leaderboard-entry--top-3');
    expect(entries[3]).not.toHaveClass('leaderboard-entry--top-4');
    expect(entries[0].querySelector('.leaderboard-entry__rank')).toHaveClass(
      'leaderboard-entry__rank--top-1',
    );
    expect(entries[1].querySelector('.leaderboard-entry__rank')).toHaveClass(
      'leaderboard-entry__rank--top-2',
    );
    expect(entries[2].querySelector('.leaderboard-entry__rank')).toHaveClass(
      'leaderboard-entry__rank--top-3',
    );
    expect(entries[3].querySelector('.leaderboard-entry__rank')).not.toHaveClass(
      'leaderboard-entry__rank--top-4',
    );
    expect(entries[0]).toHaveTextContent('1');
    expect(entries[0]).toHaveTextContent('120');
    expect(entries[0]).toHaveTextContent('< 1 minute ago');
    expect(entries[1]).toHaveTextContent('Yesterday');
    expect(entries[0].querySelectorAll('time')).toHaveLength(1);
    expect(entries[0].querySelectorAll('strong')).toHaveLength(1);
    expect(entries[0].querySelectorAll('button')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Dark mode' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Leaderboard' }));

    expect(document.querySelector('.application')).toHaveAttribute('data-dark-mode', 'true');
    const darkModeEntries = screen.getByRole('list', {
      name: 'Personal leaderboard',
    }).children;
    expect(darkModeEntries[0]).toHaveClass('leaderboard-entry--top-1');
    expect(darkModeEntries[0].querySelector('.leaderboard-entry__rank')).toHaveClass(
      'leaderboard-entry__rank--top-1',
    );
  });

  it('records a completed game exactly once with its final score', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    render(<App />);
    startRoundAndReachPlayerInput();
    fireEvent.click(screen.getByRole('button', { name: 'Select Circle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Triangle' }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const savedEntries = JSON.parse(
      window.localStorage.getItem(LEADERBOARD_STORAGE_KEY) ?? '{"entries":[]}',
    ).entries;
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0]).toMatchObject({ score: 0 });
    expect(Number.isNaN(Date.parse(savedEntries[0].date))).toBe(false);
  });

  it('keeps the settings header outside the scrollable settings content', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    const header = screen.getByRole('heading', { name: 'Settings' }).closest('.settings-header');
    const content = screen.getByRole('region', { name: 'Audio' }).closest(
      '.settings-page__content',
    );

    expect(header?.parentElement).toHaveClass('settings-page');
    expect(content).not.toBeNull();
    expect(content).not.toContainElement(screen.getByRole('heading', { name: 'Settings' }));
  });

  it('combines the system motion preference without changing the saved user preference', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;
    let systemPreference = false;
    const mediaQuery = {
      get matches() {
        return systemPreference;
      },
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(
        (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          changeHandler = listener;
        },
      ),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => mediaQuery),
    });

    render(<App />);
    const app = document.querySelector('.application');
    expect(app).toHaveAttribute('data-reduce-motion', 'false');

    act(() => {
      systemPreference = true;
      changeHandler?.({ matches: true } as MediaQueryListEvent);
    });
    expect(app).toHaveAttribute('data-reduce-motion', 'true');
    expect(JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) ?? 'null')).toMatchObject({
      reduceAnimations: false,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('switch', { name: 'Reduce animations' })).not.toBeChecked();

    act(() => {
      systemPreference = false;
      changeHandler?.({ matches: false } as MediaQueryListEvent);
    });
    expect(app).toHaveAttribute('data-reduce-motion', 'false');
    expect(screen.getByRole('switch', { name: 'Reduce animations' })).not.toBeChecked();

    fireEvent.click(screen.getByRole('switch', { name: 'Reduce animations' }));
    expect(app).toHaveAttribute('data-reduce-motion', 'true');
    act(() => {
      systemPreference = true;
      changeHandler?.({ matches: true } as MediaQueryListEvent);
    });
    expect(app).toHaveAttribute('data-reduce-motion', 'true');
    expect(JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) ?? 'null')).toMatchObject({
      reduceAnimations: true,
    });
  });

  it('triggers haptics for button interactions only while the setting is enabled', () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    render(<App />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    });
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenLastCalledWith([10]);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('switch', { name: 'Haptic feedback' }));
    });
    expect(vibrate).toHaveBeenCalledTimes(4);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    });
    expect(vibrate).toHaveBeenCalledTimes(4);
  });

  it('uses distinct haptic patterns for correct, incorrect, and game-over events', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    render(<App />);
    startRoundAndReachPlayerInput();
    fireEvent.click(screen.getByRole('button', { name: 'Select Circle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select Triangle' }));

    expect(vibrate.mock.calls).toEqual([
      [[10]],
      [[18]],
      [[40, 35, 40]],
    ]);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(vibrate.mock.calls).toEqual([
      [[10]],
      [[18]],
      [[40, 35, 40]],
      [[50, 45, 50]],
    ]);
  });

  it('applies colour blind and dark appearance settings without resetting the app', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    const appearanceSection = screen.getByRole('region', {
      name: 'Appearance & Accessibility',
    });
    const audioSection = screen.getByRole('region', { name: 'Audio' });
    expect(
      appearanceSection.compareDocumentPosition(audioSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const app = document.querySelector('.application');
    expect(app).toHaveAttribute('data-dark-mode', 'false');
    expect(app).toHaveAttribute('data-colour-blind', 'false');

    fireEvent.click(screen.getByRole('switch', { name: 'Colour blind mode' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Dark mode' }));

    expect(screen.getByRole('switch', { name: 'Colour blind mode' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeChecked();
    expect(app).toHaveAttribute('data-dark-mode', 'true');
    expect(app).toHaveAttribute('data-colour-blind', 'true');

    fireEvent.click(screen.getByRole('switch', { name: 'Dark mode' }));
    expect(app).toHaveAttribute('data-dark-mode', 'false');
    expect(app).toHaveAttribute('data-colour-blind', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(screen.getByRole('img', { name: /mini memory game logo/i })).toBeInTheDocument();
    expect(document.querySelector('.application')).toHaveAttribute(
      'data-colour-blind',
      'true',
    );
  });

  it('persists all settings independently and restores them after remounting', () => {
    const defaultReduceAnimations = createDefaultSettings().reduceAnimations;
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    fireEvent.click(screen.getByRole('switch', { name: 'Colour blind mode' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Dark mode' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Background music' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Music volume' }), {
      target: { value: '46' },
    });
    fireEvent.click(screen.getByRole('switch', { name: 'Sound effects' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Sound volume' }), {
      target: { value: '63' },
    });
    fireEvent.click(screen.getByRole('switch', { name: 'Haptic feedback' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Reduce animations' }));

    const savedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    expect(savedSettings).not.toBeNull();
    expect(JSON.parse(savedSettings ?? 'null')).toMatchObject({
      colourBlindMode: true,
      darkMode: true,
      backgroundMusic: false,
      musicVolume: 46,
      soundEffects: false,
      soundVolume: 63,
      hapticFeedback: false,
      reduceAnimations: !defaultReduceAnimations,
    });

    unmount();
    render(<App />);
    expect(document.querySelector('.application')).toHaveAttribute(
      'data-dark-mode',
      'true',
    );
    expect(document.querySelector('.application')).toHaveAttribute(
      'data-colour-blind',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('switch', { name: 'Colour blind mode' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Background music' })).not.toBeChecked();
    expect(screen.getByRole('slider', { name: 'Music volume' })).toHaveValue('46');
    expect(screen.getByRole('switch', { name: 'Sound effects' })).not.toBeChecked();
    expect(screen.getByRole('slider', { name: 'Sound volume' })).toHaveValue('63');
    expect(screen.getByRole('switch', { name: 'Haptic feedback' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Reduce animations' })).toHaveAttribute(
      'aria-checked',
      String(!defaultReduceAnimations),
    );
  });

  it('falls back to defaults for corrupted saved settings', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, '{invalid json');

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('switch', { name: 'Colour blind mode' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Dark mode' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Background music' })).toBeChecked();
    expect(screen.getByRole('slider', { name: 'Music volume' })).toHaveValue('30');
    expect(screen.getByRole('switch', { name: 'Sound effects' })).toBeChecked();
    expect(screen.getByRole('slider', { name: 'Sound volume' })).toHaveValue('70');
    expect(screen.getByRole('switch', { name: 'Haptic feedback' })).toBeChecked();
  });

  it('remains usable when browser storage is unavailable', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Dark mode' }));
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows the description and version details in the app info modal', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'App information' }));

    expect(screen.getByText(/watch the shapes, remember their order/i)).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Mini Memory Game stores your game settings locally in your browser so your preferences are remembered when you return.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'We do not use this storage to identify you or collect personal information. Your settings remain on your device and can be cleared by resetting them in Settings or clearing your browser data.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
    expect(screen.getByText('© 2026')).toBeInTheDocument();
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

  it('starts looping background music and keeps it playing when exiting to Home', () => {
    let backgroundMusicPlayed = false;
    let backgroundMusicStopped = false;

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      if (this.src.includes('bgm.mp3')) {
        expect(this.loop).toBe(true);
        backgroundMusicPlayed = true;
      }

      return Promise.resolve();
    });

    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      if (this.src.includes('bgm.mp3') && backgroundMusicPlayed) {
        backgroundMusicStopped = true;
      }
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    expect(backgroundMusicPlayed).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(backgroundMusicStopped).toBe(false);
    expect(screen.getByRole('img', { name: /mini memory game logo/i })).toBeInTheDocument();
  });
});
