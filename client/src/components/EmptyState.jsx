import AnimatedButton from "./AnimatedButton";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <p className="eyebrow">No reports yet</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && <AnimatedButton onClick={onAction}>{actionLabel}</AnimatedButton>}
    </div>
  );
}
