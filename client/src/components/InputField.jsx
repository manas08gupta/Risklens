export default function InputField({ label, hint, error, as = "input", className = "", ...props }) {
  const Control = as;
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}</span>
      <Control className="field__control" aria-invalid={Boolean(error)} {...props} />
      {(error || hint) && <span className={`field__hint${error ? " field__hint--error" : ""}`}>{error || hint}</span>}
    </label>
  );
}
