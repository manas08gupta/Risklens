export default function SelectField({ label, hint, error, options, placeholder, ...props }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select className="field__control" aria-invalid={Boolean(error)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {(error || hint) && <span className={`field__hint${error ? " field__hint--error" : ""}`}>{error || hint}</span>}
    </label>
  );
}
