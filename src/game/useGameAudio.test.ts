import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDefaultSettings } from '../services/settingsService';
import { useGameAudio } from './useGameAudio';

describe('useGameAudio', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies independent music and sound settings without restarting music on volume changes', () => {
    const playedAudio: HTMLMediaElement[] = [];
    const pausedAudio: HTMLMediaElement[] = [];

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      playedAudio.push(this);
      Object.defineProperty(this, 'paused', { configurable: true, value: false });
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      pausedAudio.push(this);
      Object.defineProperty(this, 'paused', { configurable: true, value: true });
    });

    const initialSettings = createDefaultSettings();
    const { result, rerender, unmount } = renderHook(
      ({ settings }) => useGameAudio(settings),
      { initialProps: { settings: initialSettings } },
    );

    const music = playedAudio.find((audio) => audio.src.includes('bg-music.mp3'));
    expect(music).toBeDefined();
    expect(music?.volume).toBe(0.3);

    act(() => {
      rerender({
        settings: {
          ...initialSettings,
          musicVolume: 55,
          soundVolume: 25,
        },
      });
    });

    expect(music?.volume).toBe(0.55);
    expect(playedAudio.filter((audio) => audio.src.includes('bg-music.mp3'))).toHaveLength(1);

    act(() => {
      result.current.playSound('countdown');
    });
    const countdown = playedAudio.find((audio) => audio.src.includes('beep.mp3'));
    expect(countdown?.volume).toBe(0.25);
    expect(music?.paused).toBe(false);

    act(() => {
      rerender({
        settings: {
          ...initialSettings,
          backgroundMusic: false,
          soundEffects: false,
          musicVolume: 55,
          soundVolume: 25,
        },
      });
    });

    expect(music?.paused).toBe(true);
    expect(pausedAudio).toContain(music);
    expect(countdown?.paused).toBe(true);

    const wrongSoundPlays = playedAudio.filter((audio) => audio.src.includes('wrong.mp3'));
    act(() => {
      result.current.playSound('wrong');
    });
    expect(playedAudio.filter((audio) => audio.src.includes('wrong.mp3'))).toHaveLength(
      wrongSoundPlays.length,
    );

    act(() => {
      rerender({
        settings: {
          ...initialSettings,
          backgroundMusic: true,
          soundEffects: true,
          musicVolume: 55,
          soundVolume: 25,
        },
      });
    });

    expect(music?.paused).toBe(false);
    expect(playedAudio.filter((audio) => audio.src.includes('bg-music.mp3'))).toHaveLength(2);
    expect(playedAudio.filter((audio) => audio.src.includes('countdown-10s.mp3'))).toHaveLength(0);

    act(() => {
      result.current.playSound('roundTimer');
    });
    const roundTimer = playedAudio.find((audio) =>
      audio.src.includes('countdown-10s.mp3'),
    );
    expect(roundTimer?.loop).toBe(true);

    act(() => {
      rerender({
        settings: {
          ...initialSettings,
          backgroundMusic: true,
          soundEffects: false,
          musicVolume: 55,
          soundVolume: 25,
        },
      });
    });
    expect(music?.paused).toBe(false);
    expect(roundTimer?.paused).toBe(true);

    act(() => {
      rerender({
        settings: {
          ...initialSettings,
          backgroundMusic: true,
          soundEffects: true,
          musicVolume: 55,
          soundVolume: 25,
        },
      });
    });
    expect(roundTimer?.paused).toBe(false);

    act(() => {
      result.current.stopSound('roundTimer');
    });
    expect(roundTimer?.paused).toBe(true);

    unmount();
    expect(music?.paused).toBe(true);
  });

  it('respects disabled startup settings and safely ignores event sounds without assets', () => {
    const playedAudio: HTMLMediaElement[] = [];

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      playedAudio.push(this);
      Object.defineProperty(this, 'paused', { configurable: true, value: false });
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      Object.defineProperty(this, 'paused', { configurable: true, value: true });
    });

    const initialSettings = {
      ...createDefaultSettings(),
      backgroundMusic: false,
      musicVolume: 42,
      soundEffects: false,
    };
    const { result, rerender, unmount } = renderHook(
      ({ settings }) => useGameAudio(settings),
      { initialProps: { settings: initialSettings } },
    );

    expect(playedAudio).toHaveLength(0);

    act(() => {
      result.current.playSound('buttonClick');
      result.current.playSound('correctAnswer');
      result.current.playSound('gameOver');
      result.current.playSound('countdown');
    });
    expect(playedAudio).toHaveLength(0);

    act(() => {
      rerender({
        settings: {
          ...initialSettings,
          backgroundMusic: true,
        },
      });
    });

    expect(playedAudio).toHaveLength(1);
    expect(playedAudio[0].src).toContain('bg-music.mp3');
    expect(playedAudio[0].volume).toBe(0.42);

    unmount();
  });
});
