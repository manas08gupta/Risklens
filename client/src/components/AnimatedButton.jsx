export default function AnimatedButton({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
