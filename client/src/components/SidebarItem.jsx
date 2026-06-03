import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, code, label, detail, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      onClick={onClick}
      className={({ isActive }) => `sidebar-item${isActive ? " is-active" : ""}`}
    >
      <span className="sidebar-item__code">{code}</span>
      <span>
        <strong>{label}</strong>
        {detail && <small>{detail}</small>}
      </span>
    </NavLink>
  );
}
