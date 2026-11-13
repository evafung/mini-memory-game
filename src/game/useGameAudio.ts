import { useCallback, useEffect, useRef } from 'react';

export type GameSound = 'countdown' | 'roundComplete' | 'roundTimer' | 'shapePop' | 'wrong';

const SOUND_URLS: Record<GameSound, string> = {
  countdown: new URL('../assets/beep.mp3', import.meta.url).href,
  roundComplete: new URL('../assets/bell.mp3', import.meta.url).href,
  roundTimer: new URL('../assets/countdown-10s.mp3', import.meta.url).href,
  shapePop: new URL('../assets/pop.mp3', import.meta.url).href,
  wrong: new URL('../assets/wrong.mp3', import.meta.url).href,
};

function restartAudio(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
}

export function useGameAudio() {
  const soundsRef = useRef<Record<GameSound, HTMLAudioElement> | null>(null);

  useEffect(() => {
    const sounds: Record<GameSound, HTMLAudioElement> = {
      countdown: new Audio(SOUND_URLS.countdown),
      roundComplete: new Audio(SOUND_URLS.roundComplete),
      roundTimer: new Audio(SOUND_URLS.roundTimer),
      shapePop: new Audio(SOUND_URLS.shapePop),
      wrong: new Audio(SOUND_URLS.wrong),
    };

    Object.values(sounds).forEach((audio) => {
      audio.preload = 'auto';
    });

    sounds.roundTimer.loop = true;
    soundsRef.current = sounds;

    return () => {
      Object.values(sounds).forEach((audio) => audio.pause());
      soundsRef.current = null;
    };
  }, []);

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

  return { playSound, stopSound };
}
