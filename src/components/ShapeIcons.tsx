import type { ShapeId } from '../game/engine';

interface ShapeIconProps {
  shapeId: ShapeId;
  size?: number;
  className?: string;
  faded?: boolean;
}

function ShapeGraphic({
  shapeId,
  size = 92,
  className,
  faded = false,
}: ShapeIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 100 100',
    className,
    style: { opacity: faded ? 0.45 : 1 },
  };

  const fill = {
    circle: '#EF1C27',
    square: '#079FE0',
    star: '#FFE500',
    triangle: '#20AE4B',
  }[shapeId];

  switch (shapeId) {
    case 'circle':
      return (
        <svg {...commonProps} aria-hidden="true">
          <circle cx="50" cy="50" r="31" fill={fill} />
        </svg>
      );
    case 'square':
      return (
        <svg {...commonProps} aria-hidden="true">
          <rect x="19" y="19" width="62" height="62" rx="6" fill={fill} />
        </svg>
      );
    case 'star':
      return (
        <svg {...commonProps} aria-hidden="true">
          <polygon
            points="50,11 61,39 90,39 67,57 76,89 50,68 24,89 33,57 10,39 39,39"
            fill={fill}
          />
        </svg>
      );
    case 'triangle':
      return (
        <svg {...commonProps} aria-hidden="true">
          <polygon points="50,12 88,84 12,84" fill={fill} />
        </svg>
      );
    default:
      return null;
  }
}

export function ShapeIcon(props: ShapeIconProps) {
  return <ShapeGraphic {...props} />;
}

export function GameLogo({ size = 100 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Mini Memory Game logo with four colored shapes"
    >
      <circle cx="27" cy="27" r="15" fill="#EF1C27" />
      <rect x="58" y="12" width="30" height="30" rx="3" fill="#079FE0" />
      <polygon
        points="27,56 32,68 45,69 35,77 38,90 27,82 16,90 19,77 9,69 22,68"
        fill="#FFE500"
      />
      <polygon points="73,55 91,89 55,89" fill="#20AE4B" />
    </svg>
  );
}

export function InfoIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BackArrowIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M19 12H5M12 19L5 12L12 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrophyIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M8 4H16V9C16 12.3 14.2 14 12 14C9.8 14 8 12.3 8 9V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 6H5V8C5 10 6.2 11 8.5 11M16 6H19V8C19 10 17.8 11 15.5 11M12 14V18M9 20H15M10 18H14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserRoundIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 20C5.5 16.4 8.4 14 12 14C15.6 14 18.5 16.4 18.5 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SettingsGearIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M10 3.8H14L14.6 6.1C15.2 6.3 15.7 6.6 16.2 6.9L18.4 6.2L20.4 9.7L18.7 11.3C18.8 11.9 18.8 12.5 18.7 13.1L20.4 14.7L18.4 18.2L16.2 17.5C15.7 17.8 15.2 18.1 14.6 18.3L14 20.6H10L9.4 18.3C8.8 18.1 8.3 17.8 7.8 17.5L5.6 18.2L3.6 14.7L5.3 13.1C5.2 12.5 5.2 11.9 5.3 11.3L3.6 9.7L5.6 6.2L7.8 6.9C8.3 6.6 8.8 6.3 9.4 6.1L10 3.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.2" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function MusicNoteIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M9 18V5L20 3V16M9 8L20 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="6" cy="18" rx="3" ry="2" stroke="currentColor" strokeWidth="1.7" />
      <ellipse cx="17" cy="16" rx="3" ry="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function SpeakerIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M4 10V14H8L13 18V6L8 10H4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M16 9C17.7 10.7 17.7 13.3 16 15M18.5 6.5C21.5 9.5 21.5 14.5 18.5 17.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VibrationIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4 8V16M20 8V16M3 10V14M21 10V14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M11 17H13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function AccessibilityIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="4.5" r="1.5" fill="currentColor" />
      <path
        d="M5 8L12 10L19 8M12 10V15M12 15L8 21M12 15L16 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#2FBE7B" />
      <path
        d="M7 12.5L10.5 16L17 9.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CrossMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#E14D5B" />
      <path
        d="M8 8L16 16M16 8L8 16"
        fill="none"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClockIcon({ size = 92 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="34" fill="none" stroke="#202020" strokeWidth="6" />
      <circle cx="50" cy="50" r="5" fill="#202020" />
      <path d="M50 50L50 28" stroke="#202020" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 50L68 62" stroke="#202020" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M3 10.5L12 3L21 10.5V20.5H15V14H9V20.5H3V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function ReplayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M4 11.5C4 7.9 6.9 5 10.5 5C12.8 5 14.8 6.1 16.2 7.8L18.5 5.5V11H13L15.1 8.9C14.1 7.8 12.4 7 10.4 7C7.7 7 5.5 9.2 5.5 11.9V12.1C5.5 14.8 7.7 17 10.4 17C12.2 17 13.8 16 14.8 14.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CircleProgressRing({
  progress,
  size = 110,
}: {
  progress: number;
  size?: number;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#E9E9E9" strokeWidth="7" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#1f1f1f"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 60 60)"
      />
    </svg>
  );
}

export default ShapeGraphic;
