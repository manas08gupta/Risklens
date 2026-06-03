import { Link } from "react-router-dom";
import AnimatedButton from "../../components/AnimatedButton";
import DashboardSection from "../../components/DashboardSection";
import EmptyState from "../../components/EmptyState";
import Panel from "../../components/Panel";
import { clearReports, listReports } from "../../lib/reportStore";

export default function HistoryPage() {
  const reports = listReports();

  if (!reports.length) {
    return (
      <EmptyState
        title="No saved reports yet."
        description="Generate an analysis to build a useful investor-readiness history."
        actionLabel="Create Report"
        onAction={() => { window.location.href = "/dashboard/analysis"; }}
      />
    );
  }

  return (
    <DashboardSection eyebrow="Saved Reports" title="Review prior startup analyses." description="Reports are stored locally in this MVP workspace so the experience remains useful without requiring an account system.">
      <Panel
        eyebrow="Workspace history"
        title={`${reports.length} saved report${reports.length === 1 ? "" : "s"}`}
        action={<AnimatedButton variant="secondary" onClick={() => { clearReports(); window.location.reload(); }}>Clear</AnimatedButton>}
      >
        <div className="stack">
          {reports.map((report) => {
            const analysis = report.analysis || report;
            return (
              <div className="list-row" key={report.id}>
                <div>
                  <strong>{analysis.company}</strong>
                  <p>{new Date(report.createdAt).toLocaleString()} / Risk {analysis.overallScore}/100 / Confidence {analysis.confidenceScore}/100</p>
                  <p>{analysis.narrative}</p>
                </div>
                <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                  {analysis.metadata?.provider === "local-fallback" && <span className="badge badge--fallback">Fallback</span>}
                  <Link to="/dashboard/analysis"><AnimatedButton variant="secondary">New Pass</AnimatedButton></Link>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </DashboardSection>
  );
}
