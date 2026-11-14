import { BackArrowIcon } from './ShapeIcons';

export default function PageHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <header className="settings-header">
      <button
        className="settings-header__back"
        type="button"
        aria-label="Back to Home"
        onClick={onBack}
      >
        <BackArrowIcon />
      </button>
      <h1>{title}</h1>
      <span aria-hidden="true" />
    </header>
  );
}
