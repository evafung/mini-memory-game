import { useCallback, useEffect, useRef } from 'react';
import type { AppSettings } from '../services/settingsService';

export type GameSound =
  | 'backgroundMusic'
  | 'buttonClick'
  | 'countdown'
  | 'correctAnswer'
  | 'gameOver'
  | 'roundComplete'
  | 'roundTimer'
  | 'shapePop'
  | 'wrong';

const SOUND_URLS: Record<GameSound, string | null> = {
  backgroundMusic: new URL('../assets/music/bgm.mp3', import.meta.url).href,
  buttonClick: null,
  countdown: new URL('../assets/sfx/beep.mp3', import.meta.url).href,
  correctAnswer: null,
  gameOver: null,
  roundComplete: new URL('../assets/sfx/bell.mp3', import.meta.url).href,
  roundTimer: new URL('../assets/sfx/countdown-10s.mp3', import.meta.url).href,
  shapePop: new URL('../assets/sfx/pop.mp3', import.meta.url).href,
  wrong: new URL('../assets/sfx/wrong.mp3', import.meta.url).href,
};

const SOUND_EFFECTS: readonly Exclude<GameSound, 'backgroundMusic'>[] = [
  'buttonClick',
  'countdown',
  'correctAnswer',
  'gameOver',
  'roundComplete',
  'roundTimer',
  'shapePop',
  'wrong',
];

type AudioInstances = Record<GameSound, HTMLAudioElement | null>;

function restartAudio(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
}

function reportPlaybackError(soundName: GameSound, error: unknown) {
  if (
    soundName === 'backgroundMusic' &&
    error instanceof DOMException &&
    (error.name === 'NotAllowedError' || error.name === 'AbortError')
  ) {
    return;
  }

  console.error(`Unable to play the ${soundName} sound.`, error);
}

function playAudio(audio: HTMLAudioElement, soundName: GameSound) {
  try {
    void audio.play().catch((error: unknown) => {
      reportPlaybackError(soundName, error);
    });
  } catch (error) {
    reportPlaybackError(soundName, error);
  }
}

function pauseAudio(audio: HTMLAudioElement, reset = false) {
  try {
    audio.pause();
    if (reset) {
      audio.currentTime = 0;
    }
  } catch (error) {
    console.error('Unable to stop an audio track.', error);
  }
}

export function useGameAudio(settings: AppSettings) {
  const soundsRef = useRef<AudioInstances | null>(null);
  const settingsRef = useRef(settings);
  const roundTimerRequestedRef = useRef(false);

  const startBackgroundMusic = useCallback(() => {
    const audio = soundsRef.current?.backgroundMusic;
    const currentSettings = settingsRef.current;
    if (!audio || !currentSettings.backgroundMusic || !audio.paused) {
      return;
    }

    audio.volume = currentSettings.musicVolume / 100;
    playAudio(audio, 'backgroundMusic');
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const createAudio = (soundName: GameSound) => {
      const source = SOUND_URLS[soundName];
      return source ? new Audio(source) : null;
    };
    const sounds: AudioInstances = {
      backgroundMusic: createAudio('backgroundMusic'),
      buttonClick: createAudio('buttonClick'),
      countdown: createAudio('countdown'),
      correctAnswer: createAudio('correctAnswer'),
      gameOver: createAudio('gameOver'),
      roundComplete: createAudio('roundComplete'),
      roundTimer: createAudio('roundTimer'),
      shapePop: createAudio('shapePop'),
      wrong: createAudio('wrong'),
    };

    Object.values(sounds).forEach((audio) => {
      if (audio) {
        audio.preload = 'auto';
      }
    });

    if (sounds.backgroundMusic) {
      sounds.backgroundMusic.loop = true;
    }
    if (sounds.roundTimer) {
      sounds.roundTimer.loop = true;
    }
    soundsRef.current = sounds;

    if (sounds.backgroundMusic) {
      sounds.backgroundMusic.volume = settingsRef.current.musicVolume / 100;
    }
    SOUND_EFFECTS.forEach((soundName) => {
      const audio = sounds[soundName];
      if (audio) {
        audio.volume = settingsRef.current.soundVolume / 100;
      }
    });
    document.addEventListener('pointerdown', startBackgroundMusic);
    document.addEventListener('keydown', startBackgroundMusic);

    return () => {
      document.removeEventListener('pointerdown', startBackgroundMusic);
      document.removeEventListener('keydown', startBackgroundMusic);
      Object.values(sounds).forEach((audio) => {
        if (audio) {
          pauseAudio(audio);
        }
      });
      soundsRef.current = null;
      roundTimerRequestedRef.current = false;
    };
  }, [startBackgroundMusic]);

  useEffect(() => {
    const sounds = soundsRef.current;
    if (!sounds) {
      return;
    }

    if (sounds.backgroundMusic) {
      sounds.backgroundMusic.volume = settings.musicVolume / 100;
      if (settings.backgroundMusic) {
        startBackgroundMusic();
      } else {
        pauseAudio(sounds.backgroundMusic);
      }
    }

    SOUND_EFFECTS.forEach((soundName) => {
      const audio = sounds[soundName];
      if (audio) {
        audio.volume = settings.soundVolume / 100;
      }
    });

    if (!settings.soundEffects) {
      SOUND_EFFECTS.forEach((soundName) => {
        const audio = sounds[soundName];
        if (audio) {
          pauseAudio(audio, soundName !== 'roundTimer');
        }
      });
    } else if (roundTimerRequestedRef.current) {
      const roundTimer = sounds.roundTimer;
      if (roundTimer) {
        playAudio(roundTimer, 'roundTimer');
      }
    }
  }, [
    settings.backgroundMusic,
    settings.musicVolume,
    settings.soundEffects,
    settings.soundVolume,
    startBackgroundMusic,
  ]);

  const playSound = useCallback((soundName: GameSound) => {
    if (soundName === 'backgroundMusic') {
      startBackgroundMusic();
      return;
    }

    if (soundName === 'roundTimer') {
      roundTimerRequestedRef.current = true;
    }
    if (!settingsRef.current.soundEffects) {
      return;
    }

    const audio = soundsRef.current?.[soundName];
    if (!audio) {
      return;
    }

    try {
      restartAudio(audio);
      playAudio(audio, soundName);
    } catch (error) {
      reportPlaybackError(soundName, error);
    }
  }, [startBackgroundMusic]);

  const stopSound = useCallback((soundName: GameSound) => {
    if (soundName === 'roundTimer') {
      roundTimerRequestedRef.current = false;
    }
    const audio = soundsRef.current?.[soundName];
    if (audio) {
      pauseAudio(audio);
    }
  }, []);

  return { playSound, startBackgroundMusic, stopSound };
}
