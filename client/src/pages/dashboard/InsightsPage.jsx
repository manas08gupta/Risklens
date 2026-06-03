import DashboardSection from "../../components/DashboardSection";
import EmptyState from "../../components/EmptyState";
import MetricCard from "../../components/MetricCard";
import Panel from "../../components/Panel";
import { listReports } from "../../lib/reportStore";

const riskKeys = [
  ["market", "Market"],
  ["execution", "Execution"],
  ["compliance", "Compliance"],
  ["ai", "AI Governance"],
  ["scalability", "Scalability"],
  ["monetization", "Monetization"],
];

export default function InsightsPage() {
  const reports = listReports();
  if (!reports.length) {
    return <EmptyState title="Benchmark insights need reports." description="Run at least one Analysis Lab report to populate benchmark and governance views." actionLabel="Open Analysis Lab" onAction={() => { window.location.href = "/dashboard/analysis"; }} />;
  }

  const analyses = reports.map((report) => report.analysis || report);
  const pillarScores = riskKeys.map(([key, label]) => {
    const values = analyses.map((analysis) => analysis.pillars?.find((item) => item.key === key)?.score).filter((value) => Number.isFinite(value));
    return { key, label, score: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0 };
  });
  const highest = [...pillarScores].sort((a, b) => b.score - a.score)[0];
  const fallbackCount = analyses.filter((analysis) => analysis.metadata?.provider === "local-fallback").length;

  return (
    <DashboardSection eyebrow="Benchmark Insights" title="Risk patterns across saved analyses." description="This page uses report outputs, not invented portfolio numbers. It helps founders see where readiness work is repeatedly concentrated.">
      <div className="metric-grid">
        <MetricCard label="Primary pressure" value={highest.label} detail={`${highest.score}/100 average`} tone={highest.score >= 70 ? "high" : highest.score >= 45 ? "medium" : "low"} />
        <MetricCard label="Reports analyzed" value={analyses.length} detail="Saved local reports" />
        <MetricCard label="Fallback reports" value={fallbackCount} detail="Provider unavailable during generation" tone={fallbackCount ? "medium" : "low"} />
        <MetricCard label="AI-enabled reports" value={analyses.filter((a) => (a.pillars?.find((p) => p.key === "ai")?.score || 0) > 25).length} detail="Governance surface detected" />
      </div>

      <div className="two-col">
        <Panel eyebrow="Risk distribution" title="Average pillar scores">
          <div className="stack">
            {pillarScores.map((pillar) => (
              <div key={pillar.key}>
                <div className="list-row" style={{ borderBottom: 0, paddingBottom: 8 }}>
                  <strong>{pillar.label}</strong>
                  <span className="badge">{pillar.score}/100</span>
                </div>
                <div style={{ height: 8, background: "#101010" }}>
                  <div style={{ width: `${pillar.score}%`, height: "100%", background: "var(--t1)" }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel eyebrow="AI Governance" title="Controls to make explicit">
          <div className="stack">
            {["Data provenance", "Human review boundaries", "Evaluation set quality", "Incident response path"].map((item) => (
              <div className="list-row" key={item}>
                <div>
                  <strong>{item}</strong>
                  <p>Turn this into an owner, evidence artifact, and operating cadence before investor diligence.</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardSection>
  );
}
