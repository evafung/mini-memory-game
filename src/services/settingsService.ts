export const SETTINGS_STORAGE_KEY = 'mini-memory-game:settings:v1';

export interface AppSettings {
  colourBlindMode: boolean;
  darkMode: boolean;
  backgroundMusic: boolean;
  musicVolume: number;
  soundEffects: boolean;
  soundVolume: number;
  hapticFeedback: boolean;
  reduceAnimations: boolean;
}

const BOOLEAN_SETTING_KEYS = [
  'colourBlindMode',
  'darkMode',
  'backgroundMusic',
  'soundEffects',
  'hapticFeedback',
  'reduceAnimations',
] as const satisfies readonly (keyof AppSettings)[];

const VOLUME_SETTING_KEYS = ['musicVolume', 'soundVolume'] as const;

export function createDefaultSettings(): AppSettings {
  return {
    colourBlindMode: false,
    darkMode: false,
    backgroundMusic: true,
    musicVolume: 30,
    soundEffects: true,
    soundVolume: 70,
    hapticFeedback: true,
    reduceAnimations: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface ValidationResult {
  settings: AppSettings;
  valid: boolean;
}

function normalizeSettings(value: unknown, defaults: AppSettings): ValidationResult {
  if (!isRecord(value)) {
    return { settings: defaults, valid: false };
  }

  const settings = { ...defaults };
  let valid = true;

  for (const key of BOOLEAN_SETTING_KEYS) {
    if (key in value) {
      if (typeof value[key] === 'boolean') {
        settings[key] = value[key];
      } else {
        valid = false;
      }
    }
  }

  for (const key of VOLUME_SETTING_KEYS) {
    if (key in value) {
      const volume = value[key];
      if (typeof volume === 'number' && Number.isFinite(volume)) {
        settings[key] = Math.min(100, Math.max(0, volume));
      } else {
        valid = false;
      }
    }
  }

  return { settings: valid ? settings : defaults, valid };
}

export function validateSettings(value: unknown, defaults = createDefaultSettings()): AppSettings {
  return normalizeSettings(value, defaults).settings;
}

export function loadSettings(): AppSettings {
  const defaults = createDefaultSettings();

  try {
    if (typeof window === 'undefined') {
      return defaults;
    }

    const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings === null) {
      return defaults;
    }

    const parsed: unknown = JSON.parse(storedSettings);
    const result = normalizeSettings(parsed, defaults);
    if (!result.valid) {
      console.warn('Saved settings are invalid; using the default settings.');
    }
    return result.settings;
  } catch (error) {
    console.warn('Unable to load saved settings; using the default settings.', error);
    return defaults;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(validateSettings(settings)),
    );
  } catch (error) {
    console.warn('Unable to save settings in browser storage.', error);
  }
}

export function resetSettings(): AppSettings {
  const defaults = createDefaultSettings();
  saveSettings(defaults);
  return defaults;
}
