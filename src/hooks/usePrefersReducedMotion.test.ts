import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');

afterEach(() => {
  if (originalMatchMediaDescriptor) {
    Object.defineProperty(window, 'matchMedia', originalMatchMediaDescriptor);
  } else {
    Reflect.deleteProperty(window, 'matchMedia');
  }
});

describe('usePrefersReducedMotion', () => {
  it('reads the system preference, follows changes, and removes its listener', () => {
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

    const { result, unmount } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      systemPreference = true;
      changeHandler?.({ matches: true } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);

    unmount();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
