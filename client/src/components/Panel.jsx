export default function Panel({ eyebrow, title, children, action, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      {(eyebrow || title || action) && (
        <div className="panel__header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="panel__title">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
