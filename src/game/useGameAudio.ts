import { useCallback, useEffect, useRef } from 'react';

export type GameSound =
  | 'backgroundMusic'
  | 'countdown'
  | 'roundComplete'
  | 'roundTimer'
  | 'shapePop'
  | 'wrong';

const SOUND_URLS: Record<GameSound, string> = {
  backgroundMusic: new URL('../assets/music/bg-music.mp3', import.meta.url).href,
  countdown: new URL('../assets/sfx/beep.mp3', import.meta.url).href,
  roundComplete: new URL('../assets/sfx/bell.mp3', import.meta.url).href,
  roundTimer: new URL('../assets/sfx/countdown-10s.mp3', import.meta.url).href,
  shapePop: new URL('../assets/sfx/pop.mp3', import.meta.url).href,
  wrong: new URL('../assets/sfx/wrong.mp3', import.meta.url).href,
};

function restartAudio(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
}

export function useGameAudio() {
  const soundsRef = useRef<Record<GameSound, HTMLAudioElement> | null>(null);

  const startBackgroundMusic = useCallback(() => {
    const audio = soundsRef.current?.backgroundMusic;
    if (!audio || !audio.paused) {
      return;
    }

    void audio.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        return;
      }

      console.error('Unable to play the background music.', error);
    });
  }, []);

  useEffect(() => {
    const sounds: Record<GameSound, HTMLAudioElement> = {
      backgroundMusic: new Audio(SOUND_URLS.backgroundMusic),
      countdown: new Audio(SOUND_URLS.countdown),
      roundComplete: new Audio(SOUND_URLS.roundComplete),
      roundTimer: new Audio(SOUND_URLS.roundTimer),
      shapePop: new Audio(SOUND_URLS.shapePop),
      wrong: new Audio(SOUND_URLS.wrong),
    };

    Object.values(sounds).forEach((audio) => {
      audio.preload = 'auto';
    });

    sounds.backgroundMusic.loop = true;
    sounds.roundTimer.loop = true;
    soundsRef.current = sounds;

    startBackgroundMusic();
    document.addEventListener('pointerdown', startBackgroundMusic);
    document.addEventListener('keydown', startBackgroundMusic);

    return () => {
      document.removeEventListener('pointerdown', startBackgroundMusic);
      document.removeEventListener('keydown', startBackgroundMusic);
      Object.values(sounds).forEach((audio) => audio.pause());
      soundsRef.current = null;
    };
  }, [startBackgroundMusic]);

  const playSound = useCallback((soundName: GameSound) => {
    const audio = soundsRef.current?.[soundName];
    if (!audio) {
      return;
    }

    restartAudio(audio);
    const playResult = audio.play();
    void playResult.catch((error: unknown) => {
      console.error(`Unable to play the ${soundName} sound.`, error);
    });
  }, []);

  const stopSound = useCallback((soundName: GameSound) => {
    soundsRef.current?.[soundName].pause();
  }, []);

  return { playSound, startBackgroundMusic, stopSound };
}
