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
