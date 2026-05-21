import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AnalysisWorkspace from "../features/analysis/AnalysisWorkspace";

const API = import.meta.env.VITE_APP_BASE_URL || "";
const SYNE = "'Syne', sans-serif";
const MONO = "'IBM Plex Mono', monospace";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap');`;

const C = {
  bg: "#000000",
  surface: "#050505",
  border: "#161616",
  bhi: "#242424",
  t1: "#ffffff",
  t2: "#cccccc",
  t3: "#888888",
  t4: "#444444",
  highBg: "#2a0808",
  highFg: "#ff7070",
  medBg: "#1e1600",
  medFg: "#f0c050",
  lowBg: "#051510",
  lowFg: "#50d090",
};

const PIE_COLORS = ["#fff", "#777", "#aaa", "#444", "#999", "#555"];

const DEMO_DATA = {
  revenue: [
    { month: "Jan", totalRevenue: 420000 },
    { month: "Feb", totalRevenue: 510000 },
    { month: "Mar", totalRevenue: 640000 },
    { month: "Apr", totalRevenue: 590000 },
    { month: "May", totalRevenue: 760000 },
    { month: "Jun", totalRevenue: 880000 },
    { month: "Jul", totalRevenue: 930000 },
    { month: "Aug", totalRevenue: 1040000 },
    { month: "Sep", totalRevenue: 980000 },
    { month: "Oct", totalRevenue: 1180000 },
    { month: "Nov", totalRevenue: 1260000 },
    { month: "Dec", totalRevenue: 1410000 },
  ],
  clients: [
    { name: "Northstar Capital", country: "USA", industry: "Fintech", revenue: 480000, risk: "Medium", riskScore: 68, riskProfile: "Medium" },
    { name: "Atlas BioSystems", country: "GBR", industry: "Healthcare AI", revenue: 720000, risk: "High", riskScore: 86, riskProfile: "High" },
    { name: "HelioGrid", country: "DEU", industry: "Energy", revenue: 390000, risk: "Low", riskScore: 42, riskProfile: "Low" },
    { name: "CivicStack", country: "CAN", industry: "GovTech", revenue: 610000, risk: "Medium", riskScore: 63, riskProfile: "Medium" },
    { name: "PromptWorks", country: "IND", industry: "AI Infrastructure", revenue: 820000, risk: "High", riskScore: 91, riskProfile: "High" },
  ],
  geo: [
    { country: "USA", totalExposure: 240000000, clientCount: 18 },
    { country: "GBR", totalExposure: 140000000, clientCount: 9 },
    { country: "DEU", totalExposure: 98000000, clientCount: 7 },
    { country: "IND", totalExposure: 160000000, clientCount: 12 },
    { country: "CAN", totalExposure: 74000000, clientCount: 6 },
  ],
  products: [
    { name: "AI Risk Audit", revenue: 1140000 },
    { name: "Compliance Review", revenue: 860000 },
    { name: "Market Diligence", revenue: 720000 },
    { name: "Safety Assessment", revenue: 540000 },
  ],
  alerts: [
    { severity: "High", message: "Model governance gap detected", client: "PromptWorks", type: "AI Safety" },
    { severity: "Medium", message: "Regulatory exposure requires review", client: "Atlas BioSystems", type: "Compliance" },
    { severity: "Low", message: "Market benchmark updated", client: "HelioGrid", type: "Market" },
    { severity: "High", message: "Concentration risk crossed threshold", client: "Northstar Capital", type: "Portfolio" },
  ],
  transactions: [
    { _id: "demo-1", client: "Northstar", cost: 125000, createdAt: "2026-05-10" },
    { _id: "demo-2", client: "AtlasBio", cost: 210000, createdAt: "2026-05-09" },
    { _id: "demo-3", client: "HelioGrid", cost: 87000, createdAt: "2026-05-07" },
    { _id: "demo-4", client: "PromptAI", cost: 190000, createdAt: "2026-05-05" },
  ],
};

const fmt = (n) => {
  if (!n || Number.isNaN(n)) return "$0";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
};

const riskFg = (r) => (r === "High" ? C.highFg : r === "Medium" ? C.medFg : C.lowFg);
const riskBg = (r) => (r === "High" ? C.highBg : r === "Medium" ? C.medBg : C.lowBg);

function useViewport() {
  const getWidth = () => (typeof window === "undefined" ? 1440 : window.innerWidth);
  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    const handleResize = () => setWidth(getWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width < 1100,
    isCompact: width < 1280,
  };
}

function gridColumns(layout, desktop, tablet, mobile = "1fr") {
  if (layout.isMobile) return mobile;
  if (layout.isTablet) return tablet;
  return desktop;
}

function mobileSpan(layout, span) {
  return layout.isTablet ? "auto" : span ? `span ${span}` : undefined;
}

function chartHeight(layout, mobile, tablet, desktop) {
  if (layout.isMobile) return mobile;
  if (layout.isTablet) return tablet;
  return desktop;
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a0a0a", border: `1px solid ${C.border}`, padding: "10px 14px", fontFamily: MONO, fontSize: 11, maxWidth: 220 }}>
      <p style={{ color: C.t3, marginBottom: 5, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={`${p.name}-${i}`} style={{ color: C.t1, lineHeight: 1.5 }}>
          {p.name}: {typeof p.value === "number" && p.value > 9999 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

function SectionLabel({ text, right, layout }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: layout.isMobile ? "flex-start" : "center",
        flexDirection: layout.isMobile ? "column" : "row",
        gap: layout.isMobile ? 6 : 12,
        marginBottom: layout.isMobile ? 16 : 20,
        paddingBottom: 12,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, lineHeight: 1.6 }}>{text}</span>
      {right && <span style={{ fontSize: 10, color: C.t3, fontFamily: MONO }}>{right}</span>}
    </div>
  );
}

function Box({ children, style = {}, span, layout }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        background: C.surface,
        padding: layout.isMobile ? "18px 16px" : layout.isTablet ? "22px 20px" : "26px 24px",
        gridColumn: mobileSpan(layout, span),
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Shimmer({ h = 180 }) {
  return <div style={{ height: h, background: "linear-gradient(90deg,#080808 25%,#111 50%,#080808 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />;
}

function StatCard({ label, value, sub, layout }) {
  return (
    <Box layout={layout}>
      <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: layout.isMobile ? 28 : 32, fontFamily: SYNE, fontWeight: 800, letterSpacing: "-0.03em", color: C.t1, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.t4, marginTop: 10, fontFamily: MONO, lineHeight: 1.5 }}>{sub}</p>}
    </Box>
  );
}

function RiskBadge({ level }) {
  return (
    <span style={{ padding: "4px 10px", fontSize: 9, letterSpacing: "0.12em", fontFamily: SYNE, fontWeight: 700, textTransform: "uppercase", background: riskBg(level), color: riskFg(level), whiteSpace: "nowrap" }}>
      {level || "-"}
    </span>
  );
}

function MobileClientCard({ client }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: "#080808", padding: "16px", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <p style={{ color: C.t1, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{client.name}</p>
          <p style={{ color: C.t3, fontSize: 11, fontFamily: MONO }}>{client.country} / {client.industry}</p>
        </div>
        <RiskBadge level={client.riskProfile || client.risk} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <p style={{ color: C.t4, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: SYNE, marginBottom: 5 }}>Revenue</p>
          <p style={{ color: C.t1, fontSize: 13, fontFamily: MONO }}>{fmt(client.annualRevenue || client.revenue || 0)}</p>
        </div>
        <div>
          <p style={{ color: C.t4, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: SYNE, marginBottom: 5 }}>Risk Score</p>
          <p style={{ color: C.t1, fontSize: 13, fontFamily: MONO }}>{client.riskScore || 50}</p>
        </div>
      </div>
      <div>
        <div style={{ width: "100%", height: 4, background: "#111" }}>
          <div style={{ width: `${client.riskScore || 50}%`, height: "100%", background: riskFg(client.riskProfile || client.risk) }} />
        </div>
      </div>
    </div>
  );
}

function TransactionList({ transactions }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {transactions.slice(0, 5).map((t, i) => (
        <div key={`${t._id || t.client}-${i}`} style={{ border: `1px solid ${C.border}`, background: "#080808", padding: "14px 14px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <p style={{ color: C.t1, fontSize: 13 }}>{t.buyer || t.client}</p>
            <p style={{ color: C.t1, fontSize: 12, fontFamily: MONO }}>{fmt(t.cost || t.amount || 0)}</p>
          </div>
          <p style={{ color: C.t3, fontSize: 10, fontFamily: MONO }}>
            {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB") : "-"}
          </p>
        </div>
      ))}
    </div>
  );
}

function PageOverview({ data, loading, layout }) {
  const { revenue = [], clients = [], products = [], alerts = [], transactions = [] } = data;
  const totalRev = revenue.reduce((s, r) => s + (r.totalRevenue || 0), 0);
  const highRisk = clients.filter((c) => (c.riskProfile || c.risk) === "High").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridColumns(layout, "repeat(4,minmax(0,1fr))", "repeat(2,minmax(0,1fr))"), gap: layout.isMobile ? 12 : 1 }}>
      <StatCard label="Total AUM" value={fmt(totalRev)} sub="Across all portfolios" layout={layout} />
      <StatCard label="Active Clients" value={clients.length} sub="Enterprise accounts" layout={layout} />
      <StatCard label="High Risk" value={highRisk} sub="Require immediate review" layout={layout} />
      <StatCard label="Open Alerts" value={alerts.filter((a) => a.severity === "High").length} sub="Critical severity" layout={layout} />

      <Box span={3} layout={layout}>
        <SectionLabel text="Revenue Trend / 12 Months" right={fmt(totalRev)} layout={layout} />
        {loading ? (
          <Shimmer h={chartHeight(layout, 190, 210, 230)} />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight(layout, 190, 210, 230)}>
            <AreaChart data={revenue} margin={{ top: 8, right: layout.isMobile ? 4 : 8, left: layout.isMobile ? -18 : -4, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 9, fontFamily: MONO }} axisLine={false} tickLine={false} interval={layout.isMobile ? 1 : 0} />
              <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={layout.isMobile ? 42 : 52} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="totalRevenue" stroke={C.t1} strokeWidth={1.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 3, fill: C.t1, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box layout={layout}>
        <SectionLabel text="Product Mix" layout={layout} />
        {loading ? (
          <Shimmer h={chartHeight(layout, 190, 210, 230)} />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight(layout, 190, 210, 230)}>
            <PieChart>
              <Pie data={products} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={layout.isMobile ? 58 : 74} innerRadius={layout.isMobile ? 34 : 44} strokeWidth={0}>
                {products.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
              {!layout.isMobile && <Legend iconType="square" iconSize={7} formatter={(v) => <span style={{ color: C.t2, fontSize: 10, fontFamily: MONO }}>{v}</span>} />}
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box span={2} layout={layout}>
        <SectionLabel text="Live Alerts" right={`${alerts.length} total`} layout={layout} />
        {loading ? <Shimmer h={160} /> : alerts.slice(0, 5).map((a, i) => (
          <div key={`${a.message}-${i}`} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: riskFg(a.severity), marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, color: C.t1, marginBottom: 3, lineHeight: 1.5 }}>{a.message || a.title}</p>
              <p style={{ fontSize: 10, color: C.t3, fontFamily: MONO, lineHeight: 1.5 }}>{a.client} / {a.type}</p>
            </div>
            <RiskBadge level={a.severity} />
          </div>
        ))}
      </Box>

      <Box span={2} layout={layout}>
        <SectionLabel text="Recent Transactions" layout={layout} />
        {loading ? (
          <Shimmer h={160} />
        ) : layout.isMobile ? (
          <TransactionList transactions={transactions} />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Client", "Amount", "Date"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((t, i) => (
                <tr key={`${t._id || t.client}-${i}`} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 0", color: C.t2 }}>{t.buyer || t.client}</td>
                  <td style={{ padding: "10px 0", color: C.t1, fontFamily: MONO }}>{fmt(t.cost || t.amount || 0)}</td>
                  <td style={{ padding: "10px 0", color: C.t3, fontFamily: MONO, fontSize: 11 }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </div>
  );
}

function PageRiskMap({ data, loading, layout }) {
  const { clients = [], geo = [] } = data;
  const buckets = ["Minimal", "Low", "Moderate", "Elevated", "Critical"].map((label, idx) => {
    const lo = idx * 20;
    const hi = lo + 20;
    return { label, count: clients.filter((c) => (c.riskScore || 50) >= lo && (c.riskScore || 50) < hi).length };
  });
  const geoBar = geo.slice(0, 8).map((g) => ({ country: g.country, exposure: Math.round((g.totalExposure || 0) / 1e6), clients: g.clientCount || 3 }));
  const topRisk = [...clients].sort((a, b) => (b.riskScore || 50) - (a.riskScore || 50)).slice(0, 8);

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridColumns(layout, "repeat(3,minmax(0,1fr))", "repeat(2,minmax(0,1fr))"), gap: layout.isMobile ? 12 : 1 }}>
      <StatCard label="High Risk Clients" value={clients.filter((c) => (c.riskProfile || c.risk) === "High").length} sub="Flagged for review" layout={layout} />
      <StatCard label="Countries Exposed" value={geo.length} sub="Geographic footprint" layout={layout} />
      <StatCard label="Avg Risk Score" value={clients.length ? Math.round(clients.reduce((s, c) => s + (c.riskScore || 50), 0) / clients.length) : 0} sub="Composite / out of 100" layout={layout} />

      <Box span={2} layout={layout}>
        <SectionLabel text="Risk Score Distribution" right={`${clients.length} clients scored`} layout={layout} />
        {loading ? (
          <Shimmer h={chartHeight(layout, 210, 220, 240)} />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight(layout, 210, 220, 240)}>
            <BarChart data={buckets} barSize={layout.isMobile ? 22 : 44} margin={{ top: 8, right: 6, left: layout.isMobile ? -18 : -4, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.t2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} width={layout.isMobile ? 28 : 36} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" fill="#151515" stroke="#252525" strokeWidth={1} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box layout={layout}>
        <SectionLabel text="Highest Risk Clients" layout={layout} />
        {loading ? <Shimmer h={220} /> : topRisk.map((c, i) => (
          <div key={`${c.name}-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, color: C.t1, marginBottom: 2, overflowWrap: "anywhere" }}>{c.name}</p>
              <p style={{ fontSize: 10, color: C.t3, fontFamily: MONO }}>{c.country}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 15, fontFamily: SYNE, fontWeight: 800, color: riskFg(c.riskProfile || c.risk), marginBottom: 3 }}>{c.riskScore || 50}</p>
              <RiskBadge level={c.riskProfile || c.risk} />
            </div>
          </div>
        ))}
      </Box>

      <Box span={3} layout={layout}>
        <SectionLabel text="Geographic Risk Exposure (USD Millions)" layout={layout} />
        {loading ? (
          <Shimmer h={chartHeight(layout, 210, 220, 220)} />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight(layout, 210, 220, 220)}>
            <BarChart data={geoBar} barSize={layout.isMobile ? 18 : 28} margin={{ top: 8, right: 10, left: layout.isMobile ? -18 : -4, bottom: 0 }}>
              <XAxis dataKey="country" tick={{ fill: C.t2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} width={layout.isMobile ? 28 : 36} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="exposure" name="Exposure ($M)" fill="#141414" stroke="#222" strokeWidth={1} />
              <Bar dataKey="clients" name="Clients" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth={1} />
              {!layout.isMobile && <Legend formatter={(v) => <span style={{ color: C.t2, fontSize: 10, fontFamily: MONO }}>{v}</span>} />}
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </div>
  );
}

function PageClients({ data, loading, layout }) {
  const { clients = [] } = data;
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sort, setSort] = useState("name");

  const filtered = clients
    .filter((c) => riskFilter === "All" || (c.riskProfile || c.risk) === riskFilter)
    .filter((c) =>
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.country?.toLowerCase().includes(query.toLowerCase()) ||
      c.industry?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "revenue") return (b.annualRevenue || b.revenue || 0) - (a.annualRevenue || a.revenue || 0);
      if (sort === "risk") return (b.riskScore || 50) - (a.riskScore || 50);
      return (a.name || "").localeCompare(b.name || "");
    });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: gridColumns(layout, "repeat(4,minmax(0,1fr))", "repeat(2,minmax(0,1fr))"), gap: layout.isMobile ? 12 : 1, marginBottom: layout.isMobile ? 12 : 1 }}>
        <StatCard label="Total Clients" value={clients.length} sub="All accounts" layout={layout} />
        <StatCard label="High Risk" value={clients.filter((c) => (c.riskProfile || c.risk) === "High").length} sub="Flagged" layout={layout} />
        <StatCard label="Countries" value={[...new Set(clients.map((c) => c.country))].length} sub="Geographic spread" layout={layout} />
        <StatCard label="Industries" value={[...new Set(clients.map((c) => c.industry))].length} sub="Sectors" layout={layout} />
      </div>

      <Box style={{ marginTop: 1 }} layout={layout}>
        <div style={{ display: "grid", gridTemplateColumns: layout.isMobile ? "1fr" : "minmax(0,1fr) auto auto", gap: 10, marginBottom: 20 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, country, industry..."
            style={{ width: "100%", minWidth: 0, background: "#080808", border: `1px solid ${C.border}`, color: C.t1, fontFamily: MONO, padding: "12px 14px", fontSize: 12, outline: "none" }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["All", "High", "Medium", "Low"].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                style={{
                  background: riskFilter === r ? "#111" : "transparent",
                  border: `1px solid ${riskFilter === r ? C.bhi : C.border}`,
                  color: riskFilter === r ? C.t1 : C.t3,
                  padding: "11px 14px",
                  minHeight: 42,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  fontFamily: SYNE,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: "#080808", border: `1px solid ${C.border}`, color: C.t2, fontFamily: MONO, padding: "12px 14px", minHeight: 42, fontSize: 11, outline: "none", width: layout.isMobile ? "100%" : "auto" }}>
            <option value="name">Sort: Name</option>
            <option value="revenue">Sort: Revenue</option>
            <option value="risk">Sort: Risk Score</option>
          </select>
        </div>

        {loading ? (
          <Shimmer h={400} />
        ) : layout.isMobile ? (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((c, i) => <MobileClientCard key={`${c.name}-${i}`} client={c} />)}
            {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.t3, fontFamily: MONO, fontSize: 12 }}>No clients match your filter</div>}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 760 }}>
              <thead>
                <tr>
                  {["Client", "Country", "Industry", "Revenue", "Risk Score", "Risk Level"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={`${c.name}-${i}`}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#080808"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
                  >
                    <td style={{ padding: "13px 14px", color: C.t1, fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: "13px 14px", color: C.t2, fontFamily: MONO, fontSize: 12 }}>{c.country}</td>
                    <td style={{ padding: "13px 14px", color: C.t2, fontSize: 12 }}>{c.industry}</td>
                    <td style={{ padding: "13px 14px", color: C.t1, fontFamily: MONO }}>{fmt(c.annualRevenue || c.revenue || 0)}</td>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 2, background: "#111" }}>
                          <div style={{ width: `${c.riskScore || 50}%`, height: "100%", background: riskFg(c.riskProfile || c.risk) }} />
                        </div>
                        <span style={{ color: C.t2, fontFamily: MONO, fontSize: 11 }}>{c.riskScore || 50}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 14px" }}><RiskBadge level={c.riskProfile || c.risk} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.t3, fontFamily: MONO, fontSize: 12 }}>No clients match your filter</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </div>
  );
}

function PageAnalytics({ data, loading, layout }) {
  const { revenue = [], clients = [], products = [] } = data;
  const monthlyGrowth = revenue.map((r, i) => ({
    month: r.month,
    revenue: r.totalRevenue || 0,
    growth: i > 0 ? Math.round(((r.totalRevenue - revenue[i - 1].totalRevenue) / (revenue[i - 1].totalRevenue || 1)) * 100) : 0,
  }));
  const industryData = Object.entries(
    clients.reduce((acc, c) => {
      const key = c.industry || "Other";
      acc[key] = (acc[key] || 0) + (c.annualRevenue || c.revenue || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).slice(0, 6);
  const peakRev = Math.max(...revenue.map((r) => r.totalRevenue || 0), 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridColumns(layout, "repeat(2,minmax(0,1fr))", "repeat(2,minmax(0,1fr))"), gap: layout.isMobile ? 12 : 1 }}>
      <StatCard label="Peak Month Revenue" value={fmt(peakRev)} sub="Best performing month" layout={layout} />
      <StatCard label="YTD Revenue" value={fmt(revenue.slice(0, 6).reduce((s, r) => s + (r.totalRevenue || 0), 0))} sub="Jan-Jun" layout={layout} />

      <Box span={2} layout={layout}>
        <SectionLabel text="Monthly Revenue & Growth Rate" right="12-month view" layout={layout} />
        {loading ? (
          <Shimmer h={chartHeight(layout, 230, 240, 250)} />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight(layout, 230, 240, 250)}>
            <LineChart data={monthlyGrowth} margin={{ top: 8, right: layout.isMobile ? 0 : 8, left: layout.isMobile ? -20 : -4, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 9, fontFamily: MONO }} axisLine={false} tickLine={false} interval={layout.isMobile ? 1 : 0} />
              <YAxis yAxisId="rev" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={layout.isMobile ? 42 : 52} />
              {!layout.isMobile && <YAxis yAxisId="gr" orientation="right" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={36} />}
              <Tooltip content={<Tip />} />
              <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke={C.t1} strokeWidth={1.5} dot={false} name="Revenue" />
              <Line yAxisId={layout.isMobile ? "rev" : "gr"} type="monotone" dataKey="growth" stroke={C.t3} strokeWidth={1} dot={false} strokeDasharray="4 2" name="Growth %" />
              {!layout.isMobile && <Legend formatter={(v) => <span style={{ color: C.t2, fontSize: 10, fontFamily: MONO }}>{v}</span>} />}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box layout={layout}>
        <SectionLabel text="Revenue by Industry" layout={layout} />
        {loading ? (
          <Shimmer h={chartHeight(layout, 210, 220, 230)} />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight(layout, 210, 220, 230)}>
            <BarChart data={industryData} layout="vertical" barSize={14} margin={{ top: 8, right: 8, left: layout.isMobile ? 8 : 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tick={{ fill: C.t2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} width={layout.isMobile ? 82 : 90} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" fill="#141414" stroke="#222" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box layout={layout}>
        <SectionLabel text="Product Line Performance" layout={layout} />
        {loading ? (
          <Shimmer h={chartHeight(layout, 210, 220, 230)} />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight(layout, 210, 220, 230)}>
            <PieChart>
              <Pie data={products} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={layout.isMobile ? 62 : 80} innerRadius={layout.isMobile ? 38 : 50} strokeWidth={0}>
                {products.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
              {!layout.isMobile && <Legend iconType="square" iconSize={7} formatter={(v) => <span style={{ color: C.t2, fontSize: 10, fontFamily: MONO }}>{v}</span>} />}
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </div>
  );
}

function PageReports({ data, layout }) {
  const { clients = [], revenue = [], alerts = [] } = data;
  const totalRev = revenue.reduce((s, r) => s + (r.totalRevenue || 0), 0);
  const reports = [
    { title: "Q2 2025 Risk Assessment", type: "Quarterly", size: "2.4 MB", date: "Apr 30, 2025", status: "Final" },
    { title: "Annual Portfolio Review", type: "Annual", size: "8.1 MB", date: "Jan 15, 2025", status: "Final" },
    { title: "Geographic Exposure Analysis", type: "Regional", size: "1.8 MB", date: "Mar 12, 2025", status: "Final" },
    { title: "Client Risk Heatmap Q1", type: "Risk", size: "3.2 MB", date: "Mar 31, 2025", status: "Draft" },
    { title: "Product Line Performance", type: "Financial", size: "4.5 MB", date: "Feb 28, 2025", status: "Final" },
    { title: "Regulatory Compliance Summary", type: "Compliance", size: "1.1 MB", date: "Apr 01, 2025", status: "Review" },
    { title: "High Risk Client Watchlist", type: "Risk", size: "0.9 MB", date: "May 05, 2025", status: "Live" },
  ];

  const statusStyle = (s) => ({
    Final: { bg: "#051510", fg: C.lowFg },
    Draft: { bg: "#1a0808", fg: C.highFg },
    Review: { bg: "#1a1400", fg: C.medFg },
    Live: { bg: "#0a1a20", fg: "#60c8ff" },
  }[s] || { bg: "#111", fg: C.t3 });

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridColumns(layout, "2fr 1fr", "1fr"), gap: layout.isMobile ? 12 : 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: gridColumns(layout, "repeat(3,minmax(0,1fr))", "repeat(3,minmax(0,1fr))"), gap: layout.isMobile ? 12 : 1, gridColumn: layout.isTablet ? "auto" : "span 2" }}>
        <StatCard label="Reports Generated" value={reports.length} sub="This quarter" layout={layout} />
        <StatCard label="Total AUM Reported" value={fmt(totalRev)} sub="Under management" layout={layout} />
        <StatCard label="Compliance Flags" value={alerts.filter((a) => a.type === "Compliance").length || 2} sub="Pending review" layout={layout} />
      </div>

      <Box layout={layout}>
        <SectionLabel text="Document Library" right={`${reports.length} files`} layout={layout} />
        {reports.map((r, i) => {
          const ss = statusStyle(r.status);
          return (
            <div key={`${r.title}-${i}`} style={{ display: "flex", alignItems: layout.isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: layout.isMobile ? "column" : "row", gap: 12, padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
                <div style={{ width: 34, height: 34, background: "#0a0a0a", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.t3, fontFamily: SYNE, fontWeight: 800, flexShrink: 0 }}>PDF</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: C.t1, marginBottom: 3, overflowWrap: "anywhere" }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: C.t3, fontFamily: MONO, lineHeight: 1.5 }}>{r.type} / {r.size} / {r.date}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0, width: layout.isMobile ? "100%" : "auto", justifyContent: layout.isMobile ? "space-between" : "flex-end" }}>
                <span style={{ fontSize: 9, letterSpacing: "0.12em", fontFamily: SYNE, fontWeight: 700, padding: "3px 9px", background: ss.bg, color: ss.fg }}>{r.status}</span>
                <button style={{ background: "none", border: `1px solid ${C.border}`, color: C.t2, padding: "8px 12px", fontSize: 10, letterSpacing: "0.1em", fontFamily: SYNE, fontWeight: 700, cursor: "pointer", minHeight: 36 }}>Download</button>
              </div>
            </div>
          );
        })}
      </Box>

      <Box layout={layout}>
        <SectionLabel text="Portfolio Summary" layout={layout} />
        {[
          { label: "Total Clients", value: clients.length },
          { label: "High Risk", value: clients.filter((c) => (c.riskProfile || c.risk) === "High").length },
          { label: "Medium Risk", value: clients.filter((c) => (c.riskProfile || c.risk) === "Medium").length },
          { label: "Low Risk", value: clients.filter((c) => (c.riskProfile || c.risk) === "Low").length },
          { label: "Active Alerts", value: alerts.length },
          { label: "Total Revenue", value: fmt(totalRev) },
        ].map((item, i) => (
          <div key={`${item.label}-${i}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.t3, fontFamily: MONO }}>{item.label}</span>
            <span style={{ fontSize: 13, color: C.t1, fontFamily: SYNE, fontWeight: 700, textAlign: "right" }}>{item.value}</span>
          </div>
        ))}
      </Box>
    </div>
  );
}

function PageSettings({ layout }) {
  const [twofa, setTwofa] = useState(false);
  const [notif, setNotif] = useState(true);
  const [apiVis, setApiVis] = useState(false);

  const Toggle = ({ on, onChange }) => (
    <button onClick={onChange} style={{ width: 42, height: 22, background: on ? C.t1 : "#111", border: `1px solid ${on ? C.t1 : C.border}`, cursor: "pointer", position: "relative", transition: "all 0.2s", flexShrink: 0, padding: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 12, height: 12, background: on ? "#000" : C.t4, transition: "all 0.2s" }} />
    </button>
  );

  const Field = ({ label, defaultVal, type = "text" }) => (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, marginBottom: 8 }}>{label}</p>
      <input type={type} defaultValue={defaultVal} style={{ width: "100%", background: "#080808", border: `1px solid ${C.border}`, color: C.t1, fontFamily: MONO, padding: "12px 14px", fontSize: 12, outline: "none" }} />
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridColumns(layout, "repeat(2,minmax(0,1fr))", "1fr"), gap: layout.isMobile ? 12 : 1 }}>
      <Box layout={layout}>
        <SectionLabel text="Account Profile" layout={layout} />
        <Field label="Full Name" defaultVal="Manas Gupta" />
        <Field label="Email Address" defaultVal="manas@risklens.ai" type="email" />
        <Field label="Role" defaultVal="Risk Analyst" />
        <Field label="Organisation" defaultVal="Risklens" />
        <button style={{ background: C.t1, color: "#000", border: "none", padding: "12px 24px", minHeight: 44, fontFamily: SYNE, fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginTop: 4, width: layout.isMobile ? "100%" : "auto" }}>
          Save Changes
        </button>
      </Box>

      <Box layout={layout}>
        <SectionLabel text="Security" layout={layout} />
        <Field label="Current Password" defaultVal="" type="password" />
        <Field label="New Password" defaultVal="" type="password" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: C.t1, marginBottom: 3 }}>Two-Factor Authentication</p>
            <p style={{ fontSize: 11, color: C.t3, fontFamily: MONO, lineHeight: 1.5 }}>Adds an extra layer of security</p>
          </div>
          <Toggle on={twofa} onChange={() => setTwofa((o) => !o)} />
        </div>
        <button style={{ background: "transparent", color: C.t1, border: `1px solid ${C.border}`, padding: "12px 24px", minHeight: 44, fontFamily: SYNE, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", width: layout.isMobile ? "100%" : "auto" }}>
          Update Password
        </button>
      </Box>

      <Box layout={layout}>
        <SectionLabel text="Notification Preferences" layout={layout} />
        {[
          { label: "High Risk Alerts", sub: "Critical risk events", on: notif, fn: () => setNotif((o) => !o) },
          { label: "Weekly Digest", sub: "Summary every Monday", on: true, fn: () => {} },
          { label: "Client Updates", sub: "When client profiles change", on: false, fn: () => {} },
          { label: "System Announcements", sub: "Platform updates", on: true, fn: () => {} },
        ].map((n, i) => (
          <div key={`${n.label}-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ fontSize: 13, color: C.t1, marginBottom: 3 }}>{n.label}</p>
              <p style={{ fontSize: 11, color: C.t3, fontFamily: MONO, lineHeight: 1.5 }}>{n.sub}</p>
            </div>
            <Toggle on={n.on} onChange={n.fn} />
          </div>
        ))}
      </Box>

      <Box layout={layout}>
        <SectionLabel text="API Configuration" layout={layout} />
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, marginBottom: 8 }}>API Key</p>
          <div style={{ display: "grid", gridTemplateColumns: layout.isMobile ? "1fr" : "minmax(0,1fr) auto", gap: 8 }}>
            <input type={apiVis ? "text" : "password"} defaultValue="sk-risklens-xxxxxxxxxxxxxxxxxxxxxxxx" readOnly style={{ width: "100%", minWidth: 0, background: "#080808", border: `1px solid ${C.border}`, color: C.t2, fontFamily: MONO, padding: "12px 14px", fontSize: 12, outline: "none" }} />
            <button onClick={() => setApiVis((o) => !o)} style={{ background: "#080808", border: `1px solid ${C.border}`, color: C.t2, padding: "12px 14px", fontFamily: MONO, fontSize: 11, cursor: "pointer", minHeight: 44 }}>
              {apiVis ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <Field label="MongoDB URI" defaultVal="mongodb+srv://..." />
        <Field label="AI API Endpoint" defaultVal="https://api.risklens.ai/v1" />
        <div style={{ marginTop: 8, padding: "12px 14px", background: "#080808", border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 10, color: C.lowFg, fontFamily: MONO }}>Connected / all systems operational</p>
        </div>
      </Box>
    </div>
  );
}

export default function Dashboard({ onBack }) {
  const layout = useViewport();
  const [active, setActive] = useState("Analysis Lab");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({ revenue: [], clients: [], geo: [], products: [], alerts: [], transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSidebarOpen(!layout.isTablet);
  }, [layout.isTablet]);

  useEffect(() => {
    if (!API) {
      setData(DEMO_DATA);
      setLoading(false);
      return;
    }

    const norm = (d) => (Array.isArray(d) ? d : d?.data || []);

    Promise.all([
      fetch(`${API}/sales/sales`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/client/customers`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/client/geography`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/client/products`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/client/transactions`).then((r) => r.json()).catch(() => []),
    ]).then(([r, c, g, p, t]) => {
      const mappedRevenue = (r && r.monthlyData ? r.monthlyData : []).map((m) => ({
        month: m.month.slice(0, 3),
        totalRevenue: m.totalSales,
      }));

      const mappedClients = norm(c).map((user) => ({
        name: user.name,
        country: user.country || "Unknown",
        industry: user.occupation || "Finance",
        revenue: Math.floor(Math.random() * 500000) + 100000,
        risk: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        riskScore: Math.floor(Math.random() * 60) + 40,
        riskProfile: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      }));

      const mappedGeo = norm(g).map((loc) => ({
        country: loc.id,
        totalExposure: loc.value * 12500000,
        clientCount: loc.value,
      }));

      const catMap = {};
      norm(p).forEach((prod) => {
        const stat = prod.stat && prod.stat[0] ? prod.stat[0] : {};
        const rev = stat.yearlySalesTotal || 0;
        catMap[prod.category || prod.name] = (catMap[prod.category || prod.name] || 0) + rev;
      });
      const mappedProducts = Object.keys(catMap).map((k) => ({ name: k, revenue: catMap[k] }));

      const mappedTransactions = (t && t.transactions ? t.transactions : []).map((tx) => ({
        _id: tx._id,
        client: tx.userId ? tx.userId.substring(0, 8) : "Unknown",
        cost: parseFloat(tx.cost),
        status: "COMPLETED",
        createdAt: tx.createdAt,
      }));

      const mockAlerts = [
        { severity: "High", message: "Anomalous transaction volume", client: "GlobalFin", type: "Security" },
        { severity: "Medium", message: "Exposure limit at 90%", client: "EuroRisk", type: "Threshold" },
        { severity: "Low", message: "Compliance scan completed", client: "System", type: "Audit" },
        { severity: "High", message: "Failed login attempt", client: "Admin", type: "Auth" },
      ];

      const nextData = {
        revenue: mappedRevenue,
        clients: mappedClients,
        geo: mappedGeo,
        products: mappedProducts,
        alerts: mockAlerts,
        transactions: mappedTransactions,
      };

      setData(mappedRevenue.length && mappedClients.length ? nextData : DEMO_DATA);
      setLoading(false);
    }).catch(() => {
      setData(DEMO_DATA);
      setLoading(false);
    });
  }, []);

  const NAV = [
    { label: "Analysis Lab", icon: "00" },
    { label: "Overview", icon: "01" },
    { label: "Risk Map", icon: "02" },
    { label: "Clients", icon: "03" },
    { label: "Analytics", icon: "04" },
    { label: "Reports", icon: "05" },
    { label: "Settings", icon: "06" },
  ];

  const renderPage = () => {
    const props = { data, loading, layout };
    switch (active) {
      case "Analysis Lab":
        return <AnalysisWorkspace layout={layout} theme={{ C, SYNE, MONO }} />;
      case "Overview":
        return <PageOverview {...props} />;
      case "Risk Map":
        return <PageRiskMap {...props} />;
      case "Clients":
        return <PageClients {...props} />;
      case "Analytics":
        return <PageAnalytics {...props} />;
      case "Reports":
        return <PageReports {...props} />;
      case "Settings":
        return <PageSettings layout={layout} />;
      default:
        return <PageOverview {...props} />;
    }
  };

  const sidebarWidth = layout.isTablet ? 280 : sidebarOpen ? 220 : 72;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.t1, fontFamily: "'Inter', sans-serif", overflowX: "clip" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        ${FONTS}
        *{box-sizing:border-box}
        html,body,#root{min-height:100%}
        body{overflow-x:hidden}
        ::-webkit-scrollbar{width:2px;height:2px}
        ::-webkit-scrollbar-track{background:#000}
        ::-webkit-scrollbar-thumb{background:#181818}
        input::placeholder{color:#333}
      `}</style>

      {layout.isTablet && sidebarOpen && (
        <button
          aria-label="Close menu overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", border: "none", zIndex: 55, cursor: "pointer" }}
        />
      )}

      <aside
        style={{
          width: sidebarWidth,
          minHeight: "100vh",
          height: layout.isTablet ? "100dvh" : "100vh",
          borderRight: `1px solid ${C.border}`,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          position: layout.isTablet ? "fixed" : "sticky",
          top: 0,
          left: 0,
          flexShrink: 0,
          transition: "width 0.2s, transform 0.2s",
          zIndex: 60,
          transform: layout.isTablet && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <div style={{ padding: !layout.isTablet && !sidebarOpen ? "22px 10px" : "22px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: !layout.isTablet && !sidebarOpen ? "center" : "space-between", gap: 12 }}>
          {(layout.isTablet || sidebarOpen) && <span style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 14, letterSpacing: "-0.01em", color: C.t1 }}>RiskLens <span style={{ color: C.t4 }}>AI</span></span>}
          <button onClick={() => setSidebarOpen((o) => !o)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.t3, fontSize: 11, cursor: "pointer", minWidth: 34, minHeight: 34, padding: "0 10px", fontFamily: SYNE }}>
            {layout.isTablet ? "Close" : sidebarOpen ? "Hide" : "Show"}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => {
                setActive(label);
                if (layout.isTablet) setSidebarOpen(false);
              }}
              title={label}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                padding: !layout.isTablet && !sidebarOpen ? "12px 0" : "12px 18px",
                justifyContent: !layout.isTablet && !sidebarOpen ? "center" : "flex-start",
                borderLeft: active === label ? `2px solid ${C.t1}` : "2px solid transparent",
                borderTop: "none",
                borderRight: "none",
                borderBottom: "none",
                background: active === label ? "#080808" : "transparent",
                color: active === label ? C.t1 : C.t3,
                fontSize: 12,
                letterSpacing: "0.03em",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 11, minWidth: 24, textAlign: "center", fontFamily: MONO }}>{icon}</span>
              {(layout.isTablet || sidebarOpen) && <span style={{ fontFamily: SYNE }}>{label}</span>}
            </button>
          ))}
        </nav>

        {(layout.isTablet || sidebarOpen) && onBack && (
          <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
            <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, color: C.t3, padding: "10px 14px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: SYNE, cursor: "pointer", width: "100%", minHeight: 42 }}>
              Back Home
            </button>
          </div>
        )}

        <div style={{ padding: layout.isTablet || sidebarOpen ? "12px 18px" : "12px 8px", borderTop: `1px solid ${C.border}`, textAlign: layout.isTablet || sidebarOpen ? "left" : "center" }}>
          {(layout.isTablet || sidebarOpen) && <span style={{ fontSize: 9, color: C.t4, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: SYNE }}>v1.0.0 / Enterprise</span>}
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: layout.isTablet ? 0 : 0 }}>
        <header style={{ borderBottom: `1px solid ${C.border}`, padding: layout.isMobile ? "14px 16px" : "18px 24px", display: "flex", alignItems: layout.isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16, position: "sticky", top: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)", zIndex: 40 }}>
          <div style={{ display: "flex", alignItems: layout.isMobile ? "flex-start" : "center", gap: 14 }}>
            {layout.isTablet && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.t1, minWidth: 42, minHeight: 42, padding: "0 12px", cursor: "pointer", fontFamily: SYNE }}>
                Menu
              </button>
            )}
            <div>
              <p style={{ fontSize: layout.isMobile ? 16 : 18, fontFamily: SYNE, fontWeight: 800, letterSpacing: "-0.02em", color: C.t1 }}>{active}</p>
              <p style={{ fontSize: 11, color: C.t3, marginTop: 2, fontFamily: MONO, lineHeight: 1.5 }}>
                {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", alignSelf: layout.isMobile ? "stretch" : "center" }}>
            <div style={{ fontSize: 10, color: C.lowFg, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: MONO, padding: layout.isMobile ? "6px 10px" : "6px 14px", border: "1px solid #061510", background: "#030a06", whiteSpace: "nowrap" }}>Live</div>
            <div style={{ width: 34, height: 34, background: "#0d0d0d", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, fontFamily: SYNE, color: C.t1, flexShrink: 0 }}>MG</div>
          </div>
        </header>

        <main style={{ padding: layout.isMobile ? "16px" : layout.isTablet ? "22px" : "32px 36px", flex: 1, minWidth: 0 }}>
          {renderPage()}
        </main>

        <footer style={{ borderTop: `1px solid ${C.border}`, padding: layout.isMobile ? "14px 16px 18px" : "14px 24px", display: "flex", justifyContent: "space-between", flexDirection: layout.isMobile ? "column" : "row", gap: 8 }}>
          <span style={{ fontSize: 9, color: C.t4, fontFamily: SYNE, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.6 }}>RiskLens AI / Enterprise Risk Analytics</span>
          <span style={{ fontSize: 9, color: C.t4, fontFamily: SYNE, letterSpacing: "0.1em", lineHeight: 1.6 }}>Copyright {new Date().getFullYear()} / All Rights Reserved</span>
        </footer>
      </div>
    </div>
  );
}
