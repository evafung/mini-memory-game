export type HapticEvent = 'button' | 'correct' | 'incorrect' | 'roundComplete' | 'gameOver';

const HAPTIC_PATTERNS: Record<HapticEvent, number[]> = {
  button: [10],
  correct: [18],
  incorrect: [40, 35, 40],
  roundComplete: [18, 30, 18],
  gameOver: [50, 45, 50],
};

export function triggerHaptic(event: HapticEvent, enabled: boolean): boolean {
  if (!enabled || typeof navigator === 'undefined') {
    return false;
  }

  try {
    const vibrate = navigator.vibrate;
    if (typeof vibrate !== 'function') {
      return false;
    }

    return vibrate.call(navigator, HAPTIC_PATTERNS[event]);
  } catch {
    return false;
  }
}
