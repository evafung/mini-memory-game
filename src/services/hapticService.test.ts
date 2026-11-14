import { afterEach, describe, expect, it, vi } from 'vitest';

import { triggerHaptic } from './hapticService';

const originalVibrateDescriptor = Object.getOwnPropertyDescriptor(navigator, 'vibrate');

afterEach(() => {
  if (originalVibrateDescriptor) {
    Object.defineProperty(navigator, 'vibrate', originalVibrateDescriptor);
  } else {
    Reflect.deleteProperty(navigator, 'vibrate');
  }
});

describe('haptic service', () => {
  it('uses short, distinct patterns for enabled feedback types', () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    expect(triggerHaptic('button', true)).toBe(true);
    expect(triggerHaptic('correct', true)).toBe(true);
    expect(triggerHaptic('incorrect', true)).toBe(true);

    expect(vibrate.mock.calls).toEqual([
      [[10]],
      [[18]],
      [[40, 35, 40]],
    ]);
  });

  it('does nothing when disabled, unsupported, or the API throws', () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    expect(triggerHaptic('button', false)).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();

    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });
    expect(triggerHaptic('button', true)).toBe(false);

    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vi.fn(() => {
        throw new Error('Vibration is unavailable');
      }),
    });
    expect(triggerHaptic('gameOver', true)).toBe(false);
  });
});
