export default function LoadingState({ title = "Loading", description = "Preparing the workspace." }) {
  return (
    <div className="state-card">
      <div className="state-card__pulse" />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
