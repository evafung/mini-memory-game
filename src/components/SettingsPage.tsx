import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  EyeIcon,
  AccessibilityIcon,
  BackArrowIcon,
  MoonIcon,
  MusicNoteIcon,
  SpeakerIcon,
  VibrationIcon,
} from './ShapeIcons';
import type { AppSettings } from '../services/settingsService';

function SettingToggle({
  label,
  description,
  icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: ReactNode;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="setting-row">
      <span className="setting-row__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="setting-row__copy">
        <span className="setting-row__label">{label}</span>
        <span className="setting-row__description">{description}</span>
      </div>
      <button
        className={`settings-toggle${checked ? ' settings-toggle--on' : ''}`}
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
      >
        <span className="settings-toggle__thumb" />
      </button>
    </div>
  );
}

function SettingSlider({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="settings-slider">
      <div className="settings-slider__heading">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{value}%</output>
      </div>
      <input
        id={id}
        aria-label={label}
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-section" aria-label={title}>
      <h2 className="settings-section__title">{title}</h2>
      {children}
    </section>
  );
}

function SettingsConfirmation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="settings-confirmation"
      aria-labelledby="reset-dialog-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <h2 id="reset-dialog-title">Reset personal records?</h2>
      <p>This action will permanently clear your saved personal records.</p>
      <div className="settings-confirmation__actions">
        <button type="button" className="settings-confirmation__cancel" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="settings-confirmation__reset" onClick={onClose}>
          Reset
        </button>
      </div>
    </dialog>
  );
}

interface SettingsPageProps {
  onBack: () => void;
  settings: AppSettings;
  onSettingChange: <Key extends keyof AppSettings>(
    key: Key,
    value: AppSettings[Key],
  ) => void;
}

export default function SettingsPage({
  onBack,
  settings,
  onSettingChange,
}: SettingsPageProps) {
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);

  return (
    <main className="settings-page">
      <div className="settings-page__content">
        <header className="settings-header">
          <button
            className="settings-header__back"
            type="button"
            aria-label="Back to Home"
            onClick={onBack}
          >
            <BackArrowIcon />
          </button>
          <h1>Settings</h1>
          <span aria-hidden="true" />
        </header>

        <SettingsSection title="Appearance & Accessibility">
          <SettingToggle
            label="Colour blind mode"
            description="Adjust colours for better visibility"
            icon={<EyeIcon />}
            checked={settings.colourBlindMode}
            onChange={() => onSettingChange('colourBlindMode', !settings.colourBlindMode)}
          />
          <SettingToggle
            label="Dark mode"
            description="Use a darker game appearance"
            icon={<MoonIcon />}
            checked={settings.darkMode}
            onChange={() => onSettingChange('darkMode', !settings.darkMode)}
          />
        </SettingsSection>

        <SettingsSection title="Audio">
          <SettingToggle
            label="Background music"
            description="Music during gameplay"
            icon={<MusicNoteIcon />}
            checked={settings.backgroundMusic}
            onChange={() =>
              onSettingChange('backgroundMusic', !settings.backgroundMusic)
            }
          />
          <SettingSlider
            id="music-volume"
            label="Music volume"
            value={settings.musicVolume}
            onChange={(value) => onSettingChange('musicVolume', value)}
          />
          <SettingToggle
            label="Sound effects"
            description="Button taps, countdown and game feedback"
            icon={<SpeakerIcon />}
            checked={settings.soundEffects}
            onChange={() => onSettingChange('soundEffects', !settings.soundEffects)}
          />
          <SettingSlider
            id="sound-volume"
            label="Sound volume"
            value={settings.soundVolume}
            onChange={(value) => onSettingChange('soundVolume', value)}
          />
        </SettingsSection>

        <SettingsSection title="Game Experience">
          <SettingToggle
            label="Haptic feedback"
            description="Vibration on supported devices"
            icon={<VibrationIcon />}
            checked={settings.hapticFeedback}
            onChange={() => onSettingChange('hapticFeedback', !settings.hapticFeedback)}
          />
          <SettingToggle
            label="Reduce animations"
            description="Reduce visual movement and transitions"
            icon={<AccessibilityIcon />}
            checked={settings.reduceAnimations}
            onChange={() =>
              onSettingChange('reduceAnimations', !settings.reduceAnimations)
            }
          />
        </SettingsSection>

        <SettingsSection title="Personal Data">
          <div className="setting-row setting-row--personal-data">
            <div className="setting-row__copy">
              <span className="setting-row__label">Reset personal records</span>
              <span className="setting-row__description">
                Clear your saved scores on this device
              </span>
            </div>
            <button
              className="settings-reset-button"
              type="button"
              onClick={() => setIsResetConfirmationOpen(true)}
            >
              Reset
            </button>
          </div>
        </SettingsSection>
      </div>

      <footer className="settings-footer">
        <span>Mini Memory Game</span>
        <span>Version 1.0.0</span>
      </footer>

      <SettingsConfirmation
        open={isResetConfirmationOpen}
        onClose={() => setIsResetConfirmationOpen(false)}
      />
    </main>
  );
}
