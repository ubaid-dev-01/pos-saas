export default function ActionIconButton({
  title,
  onClick,
  icon: Icon,
  tone = "neutral",
  disabled = false,
}) {
  const tones = {
    neutral: "text-text-muted hover:bg-background",
    info: "text-accent hover:bg-accent/10",
    success: "text-success hover:bg-success/10",
    warning: "text-warning hover:bg-warning/10",
    danger: "text-error hover:bg-error/10",
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        tones[tone] || tones.neutral
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
