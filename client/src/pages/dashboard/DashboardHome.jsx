import { Link } from "react-router-dom";
import AnimatedButton from "../../components/AnimatedButton";
import DashboardSection from "../../components/DashboardSection";
import MetricCard from "../../components/MetricCard";
import Panel from "../../components/Panel";
import EmptyState from "../../components/EmptyState";
import { listReports } from "../../lib/reportStore";

const avg = (items) => (items.length ? Math.round(items.reduce((sum, item) => sum + item, 0) / items.length) : 0);

export default function DashboardHome() {
  const reports = listReports();
  const scores = reports.map((item) => item.analysis?.overallScore || item.overallScore || 0).filter(Boolean);
  const confidence = reports.map((item) => item.analysis?.confidenceScore || 0).filter(Boolean);
  const aiRisk = reports.map((item) => item.analysis?.pillars?.find((p) => p.key === "ai")?.score || 0).filter(Boolean);
  const latest = reports[0];

  if (!reports.length) {
    return (
      <EmptyState
        title="Start with a real startup assessment."
        description="RiskLens is now centered on investor-readiness analysis. Generate a report to populate readiness, benchmark, and governance views."
        actionLabel="Open Analysis Lab"
        onAction={() => { window.location.href = "/dashboard/analysis"; }}
      />
    );
  }

  return (
    <DashboardSection
      eyebrow="Founder readiness"
      title="A workspace for turning startup risk into investor evidence."
      description="These summaries are derived from saved RiskLens reports in this workspace. No fake live feed, no invented enterprise telemetry."
    >
      <div className="metric-grid">
        <MetricCard label="Reports saved" value={reports.length} detail="Local workspace history" />
        <MetricCard label="Avg risk" value={`${avg(scores)}/100`} detail="Across saved companies" tone={avg(scores) >= 70 ? "high" : avg(scores) >= 45 ? "medium" : "low"} />
        <MetricCard label="Avg confidence" value={`${avg(confidence)}/100`} detail="Input completeness signal" />
        <MetricCard label="AI governance risk" value={`${avg(aiRisk)}/100`} detail="For AI-enabled startups" tone={avg(aiRisk) >= 70 ? "high" : avg(aiRisk) >= 45 ? "medium" : "low"} />
      </div>

      <div className="two-col">
        <Panel eyebrow="Latest report" title={latest.analysis?.company || latest.company}>
          <p style={{ color: "var(--t3)", lineHeight: 1.8 }}>{latest.analysis?.narrative || latest.narrative}</p>
          {latest.analysis?.metadata?.provider === "local-fallback" && <span className="badge badge--fallback">Fallback heuristic analysis used</span>}
          <div style={{ marginTop: 18 }}>
            <Link to="/dashboard/history"><AnimatedButton variant="secondary">View Saved Reports</AnimatedButton></Link>
          </div>
        </Panel>
        <Panel eyebrow="Highest leverage next steps" title="What to improve before fundraising">
          <div className="stack">
            {(latest.analysis?.recommendations || []).slice(0, 4).map((item) => (
              <div className="list-row" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.summary || item.action}</p>
                </div>
                <span className="badge">{item.priority}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardSection>
  );
}
