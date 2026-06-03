import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AnimatedButton from "../components/AnimatedButton";
import SidebarItem from "../components/SidebarItem";
import { getApiModeLabel } from "../config/api";

const nav = [
  { to: "/dashboard/analysis", code: "01", label: "Analysis Lab", detail: "Create investor-readiness reports" },
  { to: "/dashboard/history", code: "02", label: "Saved Reports", detail: "Review previous analyses" },
  { to: "/dashboard/insights", code: "03", label: "Benchmark Insights", detail: "Compare risk patterns" },
  { to: "/dashboard", code: "04", label: "Founder Readiness", detail: "Workspace summary" },
  { to: "/dashboard/settings", code: "05", label: "Settings", detail: "API and workspace status" },
];

const titles = {
  "/dashboard": ["Founder Readiness", "Workspace summary built from saved startup risk reports."],
  "/dashboard/analysis": ["Analysis Lab", "Generate a structured startup risk and investor-readiness report."],
  "/dashboard/insights": ["Benchmark Insights", "Understand recurring risk patterns across saved analyses."],
  "/dashboard/history": ["Saved Reports", "A local workspace history for your generated reports."],
  "/dashboard/settings": ["Settings", "Deployment, API, and workspace configuration."],
};

export default function DashboardLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [title, subtitle] = useMemo(() => titles[location.pathname] || titles["/dashboard"], [location.pathname]);

  useEffect(() => {
    const update = () => {
      try {
        setReportCount(JSON.parse(localStorage.getItem("risklens.reports.v1") || "[]").length);
      } catch {
        setReportCount(0);
      }
    };
    update();
    window.addEventListener("risklens:reports-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("risklens:reports-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className={`dashboard-shell${menuOpen ? " is-menu-open" : ""}`}>
      {menuOpen && <button aria-label="Close navigation overlay" className="sidebar-scrim" onClick={() => setMenuOpen(false)} />}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          <Link to="/dashboard/analysis" aria-label="RiskLens dashboard">
            <strong>RiskLens <span style={{ color: "var(--t4)" }}>AI</span></strong>
          </Link>
          <AnimatedButton variant="secondary" className="mobile-menu" onClick={() => setMenuOpen(false)}>Close</AnimatedButton>
        </div>
        <nav className="dashboard-sidebar__nav" aria-label="Workspace navigation">
          {nav.map((item) => <SidebarItem key={item.to} {...item} />)}
        </nav>
        <div className="panel" style={{ margin: 14, padding: 14 }}>
          <p className="eyebrow">Workspace</p>
          <div className="list-row" style={{ paddingBottom: 0 }}>
            <div>
              <strong>{reportCount} reports</strong>
              <p>{getApiModeLabel()}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <AnimatedButton variant="secondary" className="mobile-menu" onClick={() => setMenuOpen(true)}>Menu</AnimatedButton>
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>
          <Link to="/" className="badge">Home</Link>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
