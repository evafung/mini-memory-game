import { beforeEach, describe, expect, it } from 'vitest';

import {
  createDefaultSettings,
  resetSettings,
  SETTINGS_STORAGE_KEY,
  validateSettings,
} from './settingsService';

describe('settings service', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('ignores unknown keys and clamps finite volume values', () => {
    const defaults = createDefaultSettings();

    expect(
      validateSettings(
        {
          colourBlindMode: true,
          musicVolume: 135,
          soundVolume: -12,
          futureSetting: 'ignored',
        },
        defaults,
      ),
    ).toEqual({
      ...defaults,
      colourBlindMode: true,
      musicVolume: 100,
      soundVolume: 0,
    });
  });

  it('falls back to defaults if a known setting has an invalid type', () => {
    const defaults = createDefaultSettings();

    expect(
      validateSettings(
        {
          colourBlindMode: true,
          darkMode: 'true',
        },
        defaults,
      ),
    ).toEqual(defaults);
  });

  it('resets and persists only default settings', () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ darkMode: true, musicVolume: 5 }),
    );

    const defaults = resetSettings();

    expect(JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) ?? 'null')).toEqual(
      defaults,
    );
  });
});
