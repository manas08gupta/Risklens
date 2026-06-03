export default function DashboardSection({ eyebrow, title, description, children }) {
  return (
    <div className="dashboard-section">
      <div className="dashboard-section__copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
