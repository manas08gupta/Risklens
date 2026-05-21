export const VISUAL_SECTIONS = [
  { id: "overview", label: "Overview", code: "01", kicker: "Signal Intake" },
  { id: "ecosystem", label: "Risk Map", code: "02", kicker: "Exposure Field" },
  { id: "governance", label: "AI Governance", code: "03", kicker: "Control Plane" },
  { id: "benchmarks", label: "Analytics", code: "04", kicker: "Peer Delta" },
  { id: "prediction", label: "Performance", code: "05", kicker: "Forward Lens" },
  { id: "confidence", label: "Insights", code: "06", kicker: "Investor Readiness" },
  { id: "timeline", label: "Timeline", code: "07", kicker: "Projection Stack" },
  { id: "wall", label: "Reports", code: "08", kicker: "Insight Wall" },
];

export const volatilityNodes = [
  { label: "Liquidity", x: 18, y: 34, size: 64, tone: "low" },
  { label: "Model Drift", x: 39, y: 21, size: 96, tone: "high" },
  { label: "Hiring", x: 63, y: 42, size: 76, tone: "medium" },
  { label: "Regulatory", x: 78, y: 24, size: 112, tone: "high" },
  { label: "Infra", x: 27, y: 72, size: 82, tone: "medium" },
  { label: "Market", x: 58, y: 74, size: 128, tone: "low" },
];

export const governanceRings = [
  { label: "Data lineage", value: 84 },
  { label: "Human review", value: 72 },
  { label: "Incident response", value: 91 },
  { label: "Model logging", value: 68 },
];

export const benchmarkRows = [
  { name: "Capital efficiency", value: 78, peer: 61 },
  { name: "Security maturity", value: 86, peer: 70 },
  { name: "Founder clarity", value: 74, peer: 66 },
  { name: "Compliance velocity", value: 63, peer: 52 },
  { name: "Revenue resilience", value: 88, peer: 73 },
];

export const projectionEvents = [
  ["Now", "Risk surface stabilized after governance patch"],
  ["30D", "Benchmark score crosses Series A median"],
  ["60D", "Infra margin expands under simulated demand"],
  ["90D", "Investor confidence enters high-conviction band"],
];

export function makeVisualizationData(data) {
  const revenue = data.revenue?.length ? data.revenue : [];
  const clients = data.clients?.length ? data.clients : [];
  const totalRevenue = revenue.reduce((sum, row) => sum + (row.totalRevenue || 0), 0);
  const avgRisk = clients.length
    ? Math.round(clients.reduce((sum, row) => sum + (row.riskScore || 50), 0) / clients.length)
    : 67;
  const highRisk = clients.filter((row) => (row.riskProfile || row.risk) === "High").length || 2;

  return {
    totalRevenue,
    avgRisk,
    highRisk,
    runwayIndex: 82,
    governanceScore: 76,
    investorConfidence: 88,
    revenue: revenue.map((row, index) => ({
      month: row.month,
      value: row.totalRevenue || 0,
      forecast: Math.round((row.totalRevenue || 0) * (1.04 + index * 0.008)),
    })),
    clients,
  };
}
