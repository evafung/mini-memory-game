import type { ReactNode } from 'react';
import {
  SettingsGearIcon,
  TrophyIcon,
  UserRoundIcon,
} from './ShapeIcons';

function NavigationIconButton({
  label,
  children,
  disabled = false,
  onClick,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="home-navigation__tooltip" data-tooltip={label}>
      <button
        className="home-navigation__button"
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}

export default function HomeNavigation({
  onSettings,
}: {
  onSettings: () => void;
}) {
  return (
    <nav className="home-navigation" aria-label="Home">
      <div className="home-navigation__slot">
        <NavigationIconButton label="Leaderboard" disabled>
          <TrophyIcon />
        </NavigationIconButton>
      </div>
      <div className="home-navigation__slot">
        <NavigationIconButton label="Profile" disabled>
          <UserRoundIcon />
        </NavigationIconButton>
      </div>
      <div className="home-navigation__slot">
        <NavigationIconButton label="Settings" onClick={onSettings}>
          <SettingsGearIcon />
        </NavigationIconButton>
      </div>
    </nav>
  );
}
