export default function MetricCard({ label, value, detail, tone = "neutral" }) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </div>
  );
}
