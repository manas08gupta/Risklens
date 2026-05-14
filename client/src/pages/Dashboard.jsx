import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const API = import.meta.env.VITE_APP_BASE_URL || "http://localhost:5001";
const SYNE = "'Syne', sans-serif";
const MONO = "'IBM Plex Mono', monospace";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap');`;

/* ─── colour system ─────────────────────────────────────────────────────── */
// ALL text is some shade of white — nothing dark on dark
const C = {
  bg:      "#000000",
  surface: "#050505",
  border:  "#161616",
  bhi:     "#242424",
  // text — from bright to dim, all readable on black
  t1: "#ffffff",   // primary headings / numbers
  t2: "#cccccc",   // body text / table rows
  t3: "#888888",   // secondary labels
  t4: "#444444",   // muted / metadata
  // risk colours
  highBg: "#2a0808", highFg: "#ff7070",
  medBg:  "#1e1600", medFg:  "#f0c050",
  lowBg:  "#051510", lowFg:  "#50d090",
};

const PIE_COLORS = ["#fff", "#777", "#aaa", "#444", "#999", "#555"];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) => {
  if (!n || isNaN(n)) return "$0";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
};

const riskFg = (r) => r === "High" ? C.highFg : r === "Medium" ? C.medFg : C.lowFg;
const riskBg = (r) => r === "High" ? C.highBg : r === "Medium" ? C.medBg  : C.lowBg;

/* ─── shared UI atoms ────────────────────────────────────────────────────── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a0a0a", border: `1px solid ${C.border}`, padding: "10px 14px", fontFamily: MONO, fontSize: 11 }}>
      <p style={{ color: C.t3, marginBottom: 5, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: C.t1 }}>
          {p.name}: {typeof p.value === "number" && p.value > 9999 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

function SectionLabel({ text, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE }}>{text}</span>
      {right && <span style={{ fontSize: 10, color: C.t3, fontFamily: MONO }}>{right}</span>}
    </div>
  );
}

function Box({ children, style = {}, span }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.surface, padding: "26px 24px", gridColumn: span ? `span ${span}` : undefined, ...style }}>
      {children}
    </div>
  );
}

function Shimmer({ h = 180 }) {
  return (
    <div style={{ height: h, background: `linear-gradient(90deg,#080808 25%,#111 50%,#080808 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
  );
}

function StatCard({ label, value, sub }) {
  return (
    <Box>
      <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, marginBottom: 12 }}>{label}</p>
      <p style={{ fontSize: 32, fontFamily: SYNE, fontWeight: 800, letterSpacing: "-0.03em", color: C.t1, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.t4, marginTop: 10, fontFamily: MONO }}>{sub}</p>}
    </Box>
  );
}

function RiskBadge({ level }) {
  return (
    <span style={{ padding: "3px 10px", fontSize: 9, letterSpacing: "0.12em", fontFamily: SYNE, fontWeight: 700, textTransform: "uppercase", background: riskBg(level), color: riskFg(level) }}>
      {level || "—"}
    </span>
  );
}

/* ══════════════════════════════════════════════════ PAGE: OVERVIEW */
function PageOverview({ data, loading }) {
  const { revenue = [], clients = [], products = [], alerts = [], transactions = [] } = data;
  const totalRev = revenue.reduce((s, r) => s + (r.totalRevenue || 0), 0);
  const highRisk = clients.filter(c => (c.riskProfile || c.risk) === "High").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1 }}>
      <StatCard label="Total AUM"        value={fmt(totalRev)}   sub="Across all portfolios" />
      <StatCard label="Active Clients"   value={clients.length}  sub="Enterprise accounts" />
      <StatCard label="High Risk"        value={highRisk}         sub="Require immediate review" />
      <StatCard label="Open Alerts"      value={alerts.filter(a => a.severity === "High").length} sub="Critical severity" />

      {/* Revenue area */}
      <Box span={3}>
        <SectionLabel text="Revenue Trend · 12 Months" right={fmt(totalRev)} />
        {loading ? <Shimmer /> : (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#fff" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#fff" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 9, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="totalRevenue" stroke={C.t1} strokeWidth={1.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 3, fill: C.t1, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* Product pie */}
      <Box>
        <SectionLabel text="Product Mix" />
        {loading ? <Shimmer /> : (
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={products} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={74} innerRadius={44} strokeWidth={0}>
                {products.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
              <Legend iconType="square" iconSize={7} formatter={v => <span style={{ color: C.t2, fontSize: 10, fontFamily: MONO }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* Alerts */}
      <Box span={2}>
        <SectionLabel text="Live Alerts" right={`${alerts.length} total`} />
        {loading ? <Shimmer h={160} /> : alerts.slice(0, 5).map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: riskFg(a.severity), marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: C.t1, marginBottom: 3 }}>{a.message || a.title}</p>
              <p style={{ fontSize: 10, color: C.t3, fontFamily: MONO }}>{a.client} · {a.type}</p>
            </div>
            <RiskBadge level={a.severity} />
          </div>
        ))}
      </Box>

      {/* Transactions */}
      <Box span={2}>
        <SectionLabel text="Recent Transactions" />
        {loading ? <Shimmer h={160} /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>{["Client", "Amount", "Date"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((t, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 0", color: C.t2 }}>{t.buyer || t.client}</td>
                  <td style={{ padding: "10px 0", color: C.t1, fontFamily: MONO }}>{fmt(t.cost || t.amount || 0)}</td>
                  <td style={{ padding: "10px 0", color: C.t3, fontFamily: MONO, fontSize: 11 }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </div>
  );
}

/* ══════════════════════════════════════════════════ PAGE: RISK MAP */
function PageRiskMap({ data, loading }) {
  const { clients = [], geo = [] } = data;

  const buckets = ["Minimal","Low","Moderate","Elevated","Critical"].map((label, idx) => {
    const lo = idx * 20, hi = lo + 20;
    return { label, count: clients.filter(c => (c.riskScore || 50) >= lo && (c.riskScore || 50) < hi).length };
  });

  const geoBar = geo.slice(0, 8).map(g => ({
    country: g.country,
    exposure: Math.round((g.totalExposure || 0) / 1e6),
    clients: g.clientCount || 3,
  }));

  const topRisk = [...clients].sort((a, b) => (b.riskScore || 50) - (a.riskScore || 50)).slice(0, 8);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1 }}>
      <StatCard label="High Risk Clients" value={clients.filter(c => (c.riskProfile||c.risk)==="High").length} sub="Flagged for review" />
      <StatCard label="Countries Exposed"  value={geo.length}   sub="Geographic footprint" />
      <StatCard label="Avg Risk Score"     value={clients.length ? Math.round(clients.reduce((s,c)=>s+(c.riskScore||50),0)/clients.length) : 0} sub="Composite · out of 100" />

      <Box span={2}>
        <SectionLabel text="Risk Score Distribution" right={`${clients.length} clients scored`} />
        {loading ? <Shimmer h={220} /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={buckets} barSize={44}>
              <XAxis dataKey="label" tick={{ fill: C.t2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" fill="#151515" stroke="#252525" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box>
        <SectionLabel text="Highest Risk Clients" />
        {loading ? <Shimmer h={220} /> : topRisk.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ fontSize: 12, color: C.t1, marginBottom: 2 }}>{c.name}</p>
              <p style={{ fontSize: 10, color: C.t3, fontFamily: MONO }}>{c.country}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 15, fontFamily: SYNE, fontWeight: 800, color: riskFg(c.riskProfile || c.risk), marginBottom: 3 }}>
                {c.riskScore || 50}
              </p>
              <RiskBadge level={c.riskProfile || c.risk} />
            </div>
          </div>
        ))}
      </Box>

      <Box span={3}>
        <SectionLabel text="Geographic Risk Exposure (USD Millions)" />
        {loading ? <Shimmer h={200} /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={geoBar} barSize={28}>
              <XAxis dataKey="country" tick={{ fill: C.t2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="exposure" name="Exposure ($M)" fill="#141414" stroke="#222" strokeWidth={1} />
              <Bar dataKey="clients"  name="Clients"       fill="#1e1e1e" stroke="#2a2a2a" strokeWidth={1} />
              <Legend formatter={v => <span style={{ color: C.t2, fontSize: 10, fontFamily: MONO }}>{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </div>
  );
}

/* ══════════════════════════════════════════════════ PAGE: CLIENTS */
function PageClients({ data, loading }) {
  const { clients = [] } = data;
  const [query, setQuery]         = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sort, setSort]           = useState("name");

  const filtered = clients
    .filter(c => riskFilter === "All" || (c.riskProfile || c.risk) === riskFilter)
    .filter(c =>
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.country?.toLowerCase().includes(query.toLowerCase()) ||
      c.industry?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "revenue") return (b.annualRevenue || b.revenue || 0) - (a.annualRevenue || a.revenue || 0);
      if (sort === "risk")    return (b.riskScore || 50) - (a.riskScore || 50);
      return (a.name || "").localeCompare(b.name || "");
    });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, marginBottom: 1 }}>
        <StatCard label="Total Clients"  value={clients.length} sub="All accounts" />
        <StatCard label="High Risk"      value={clients.filter(c=>(c.riskProfile||c.risk)==="High").length}   sub="Flagged" />
        <StatCard label="Countries"      value={[...new Set(clients.map(c=>c.country))].length}  sub="Geographic spread" />
        <StatCard label="Industries"     value={[...new Set(clients.map(c=>c.industry))].length} sub="Sectors" />
      </div>

      <Box style={{ marginTop: 1 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, country, industry…"
            style={{ flex: 1, minWidth: 200, background: "#080808", border: `1px solid ${C.border}`, color: C.t1, fontFamily: MONO, padding: "10px 14px", fontSize: 12, outline: "none" }} />
          {["All","High","Medium","Low"].map(r => (
            <button key={r} onClick={() => setRiskFilter(r)} style={{
              background: riskFilter === r ? "#111" : "transparent",
              border: `1px solid ${riskFilter === r ? C.bhi : C.border}`,
              color: riskFilter === r ? C.t1 : C.t3,
              padding: "10px 16px", fontSize: 10, letterSpacing: "0.1em", fontFamily: SYNE, fontWeight: 700, textTransform: "uppercase", cursor: "pointer",
            }}>{r}</button>
          ))}
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background: "#080808", border: `1px solid ${C.border}`, color: C.t2, fontFamily: MONO, padding: "10px 14px", fontSize: 11, outline: "none" }}>
            <option value="name">Sort: Name</option>
            <option value="revenue">Sort: Revenue</option>
            <option value="risk">Sort: Risk Score</option>
          </select>
        </div>

        {loading ? <Shimmer h={400} /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>{["Client","Country","Industry","Revenue","Risk Score","Risk Level"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, fontWeight: 700 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = "#080808"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
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
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.t3, fontFamily: MONO, fontSize: 12 }}>No clients match your filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </div>
  );
}

/* ══════════════════════════════════════════════════ PAGE: ANALYTICS */
function PageAnalytics({ data, loading }) {
  const { revenue = [], clients = [], products = [] } = data;

  const monthlyGrowth = revenue.map((r, i) => ({
    month: r.month,
    revenue: r.totalRevenue || 0,
    growth: i > 0 ? Math.round(((r.totalRevenue - revenue[i-1].totalRevenue) / (revenue[i-1].totalRevenue || 1)) * 100) : 0,
  }));

  const industryData = Object.entries(
    clients.reduce((acc, c) => {
      const k = c.industry || "Other";
      acc[k] = (acc[k] || 0) + (c.annualRevenue || c.revenue || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).slice(0, 6);

  const peakRev = Math.max(...revenue.map(r => r.totalRevenue || 0), 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1 }}>
      <StatCard label="Peak Month Revenue" value={fmt(peakRev)} sub="Best performing month" />
      <StatCard label="YTD Revenue" value={fmt(revenue.slice(0,6).reduce((s,r)=>s+(r.totalRevenue||0),0))} sub="Jan–Jun" />

      <Box span={2}>
        <SectionLabel text="Monthly Revenue & Growth Rate" right="12-month view" />
        {loading ? <Shimmer h={230} /> : (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={monthlyGrowth}>
              <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 9, fontFamily: MONO }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
              <YAxis yAxisId="gr" orientation="right" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} width={36} />
              <Tooltip content={<Tip />} />
              <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke={C.t1} strokeWidth={1.5} dot={false} name="Revenue" />
              <Line yAxisId="gr"  type="monotone" dataKey="growth"  stroke={C.t3} strokeWidth={1} dot={false} strokeDasharray="4 2" name="Growth %" />
              <Legend formatter={v => <span style={{ color: C.t2, fontSize: 10, fontFamily: MONO }}>{v}</span>} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box>
        <SectionLabel text="Revenue by Industry" />
        {loading ? <Shimmer h={210} /> : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={industryData} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fill: C.t3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tick={{ fill: C.t2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" fill="#141414" stroke="#222" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box>
        <SectionLabel text="Product Line Performance" />
        {loading ? <Shimmer h={210} /> : (
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={products} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} strokeWidth={0}>
                {products.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
              <Legend iconType="square" iconSize={7} formatter={v => <span style={{ color: C.t2, fontSize: 10, fontFamily: MONO }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </div>
  );
}

/* ══════════════════════════════════════════════════ PAGE: REPORTS */
function PageReports({ data }) {
  const { clients = [], revenue = [], alerts = [] } = data;
  const totalRev = revenue.reduce((s, r) => s + (r.totalRevenue || 0), 0);

  const reports = [
    { title: "Q2 2025 Risk Assessment",        type: "Quarterly", size: "2.4 MB", date: "Apr 30, 2025", status: "Final"  },
    { title: "Annual Portfolio Review",         type: "Annual",    size: "8.1 MB", date: "Jan 15, 2025", status: "Final"  },
    { title: "Geographic Exposure Analysis",    type: "Regional",  size: "1.8 MB", date: "Mar 12, 2025", status: "Final"  },
    { title: "Client Risk Heatmap Q1",          type: "Risk",      size: "3.2 MB", date: "Mar 31, 2025", status: "Draft"  },
    { title: "Product Line Performance",        type: "Financial", size: "4.5 MB", date: "Feb 28, 2025", status: "Final"  },
    { title: "Regulatory Compliance Summary",   type: "Compliance",size: "1.1 MB", date: "Apr 01, 2025", status: "Review" },
    { title: "High Risk Client Watchlist",      type: "Risk",      size: "0.9 MB", date: "May 05, 2025", status: "Live"   },
  ];

  const statusStyle = (s) => ({
    Final:  { bg: "#051510", fg: C.lowFg  },
    Draft:  { bg: "#1a0808", fg: C.highFg },
    Review: { bg: "#1a1400", fg: C.medFg  },
    Live:   { bg: "#0a1a20", fg: "#60c8ff" },
  }[s] || { bg: "#111", fg: C.t3 });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, gridColumn: "span 2" }}>
        <StatCard label="Reports Generated" value={reports.length}   sub="This quarter" />
        <StatCard label="Total AUM Reported" value={fmt(totalRev)}   sub="Under management" />
        <StatCard label="Compliance Flags"   value={alerts.filter(a=>a.type==="Compliance").length || 2} sub="Pending review" />
      </div>

      <Box>
        <SectionLabel text="Document Library" right={`${reports.length} files`} />
        {reports.map((r, i) => {
          const ss = statusStyle(r.status);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 34, height: 34, background: "#0a0a0a", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.t3, fontFamily: SYNE, fontWeight: 800 }}>PDF</div>
                <div>
                  <p style={{ fontSize: 12, color: C.t1, marginBottom: 3 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: C.t3, fontFamily: MONO }}>{r.type} · {r.size} · {r.date}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 9, letterSpacing: "0.12em", fontFamily: SYNE, fontWeight: 700, padding: "3px 9px", background: ss.bg, color: ss.fg }}>{r.status}</span>
                <button style={{ background: "none", border: `1px solid ${C.border}`, color: C.t2, padding: "5px 12px", fontSize: 10, letterSpacing: "0.1em", fontFamily: SYNE, fontWeight: 700, cursor: "pointer" }}>↓</button>
              </div>
            </div>
          );
        })}
      </Box>

      <Box>
        <SectionLabel text="Portfolio Summary" />
        {[
          { label: "Total Clients",  value: clients.length },
          { label: "High Risk",      value: clients.filter(c=>(c.riskProfile||c.risk)==="High").length },
          { label: "Medium Risk",    value: clients.filter(c=>(c.riskProfile||c.risk)==="Medium").length },
          { label: "Low Risk",       value: clients.filter(c=>(c.riskProfile||c.risk)==="Low").length },
          { label: "Active Alerts",  value: alerts.length },
          { label: "Total Revenue",  value: fmt(totalRev) },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.t3, fontFamily: MONO }}>{item.label}</span>
            <span style={{ fontSize: 13, color: C.t1, fontFamily: SYNE, fontWeight: 700 }}>{item.value}</span>
          </div>
        ))}
      </Box>
    </div>
  );
}

/* ══════════════════════════════════════════════════ PAGE: SETTINGS */
function PageSettings() {
  const [twofa, setTwofa] = useState(false);
  const [notif, setNotif] = useState(true);
  const [apiVis, setApiVis] = useState(false);

  const Toggle = ({ on, onChange }) => (
    <div onClick={onChange} style={{ width: 40, height: 20, background: on ? C.t1 : "#111", border: `1px solid ${on ? C.t1 : C.border}`, cursor: "pointer", position: "relative", transition: "all 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 12, height: 12, background: on ? "#000" : C.t4, transition: "all 0.2s" }} />
    </div>
  );

  const Field = ({ label, defaultVal, type = "text" }) => (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, marginBottom: 8 }}>{label}</p>
      <input type={type} defaultValue={defaultVal}
        style={{ width: "100%", background: "#080808", border: `1px solid ${C.border}`, color: C.t1, fontFamily: MONO, padding: "11px 14px", fontSize: 12, outline: "none" }} />
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
      <Box>
        <SectionLabel text="Account Profile" />
        <Field label="Full Name"         defaultVal="Manas Gupta" />
        <Field label="Email Address"     defaultVal="manas@risklens.ai" type="email" />
        <Field label="Role"              defaultVal="Risk Analyst" />
        <Field label="Organisation"      defaultVal="Risklens" />
        <button style={{ background: C.t1, color: "#000", border: "none", padding: "12px 24px", fontFamily: SYNE, fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginTop: 4 }}>
          Save Changes
        </button>
      </Box>

      <Box>
        <SectionLabel text="Security" />
        <Field label="Current Password" defaultVal="" type="password" />
        <Field label="New Password"     defaultVal="" type="password" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: C.t1, marginBottom: 3 }}>Two-Factor Authentication</p>
            <p style={{ fontSize: 11, color: C.t3, fontFamily: MONO }}>Adds an extra layer of security</p>
          </div>
          <Toggle on={twofa} onChange={() => setTwofa(o => !o)} />
        </div>
        <button style={{ background: "transparent", color: C.t1, border: `1px solid ${C.border}`, padding: "12px 24px", fontFamily: SYNE, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
          Update Password
        </button>
      </Box>

      <Box>
        <SectionLabel text="Notification Preferences" />
        {[
          { label: "High Risk Alerts",    sub: "Critical risk events",        on: notif, fn: () => setNotif(o=>!o) },
          { label: "Weekly Digest",       sub: "Summary every Monday",         on: true,  fn: () => {} },
          { label: "Client Updates",      sub: "When client profiles change",  on: false, fn: () => {} },
          { label: "System Announcements",sub: "Platform updates",             on: true,  fn: () => {} },
        ].map((n, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ fontSize: 13, color: C.t1, marginBottom: 3 }}>{n.label}</p>
              <p style={{ fontSize: 11, color: C.t3, fontFamily: MONO }}>{n.sub}</p>
            </div>
            <Toggle on={n.on} onChange={n.fn} />
          </div>
        ))}
      </Box>

      <Box>
        <SectionLabel text="API Configuration" />
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.t3, fontFamily: SYNE, marginBottom: 8 }}>API Key</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input type={apiVis ? "text" : "password"} defaultValue="sk-risklens-xxxxxxxxxxxxxxxxxxxxxxxx" readOnly
              style={{ flex: 1, background: "#080808", border: `1px solid ${C.border}`, color: C.t2, fontFamily: MONO, padding: "11px 14px", fontSize: 12, outline: "none" }} />
            <button onClick={() => setApiVis(o => !o)}
              style={{ background: "#080808", border: `1px solid ${C.border}`, color: C.t2, padding: "11px 14px", fontFamily: MONO, fontSize: 11, cursor: "pointer" }}>
              {apiVis ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <Field label="MongoDB URI"       defaultVal="mongodb+srv://…" />
        <Field label="AI API Endpoint"   defaultVal="https://api.risklens.ai/v1" />
        <div style={{ marginTop: 8, padding: "12px 14px", background: "#080808", border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 10, color: C.lowFg, fontFamily: MONO }}>● Connected · All systems operational</p>
        </div>
      </Box>
    </div>
  );
}

/* ══════════════════════════════════════════════════ ROOT */
export default function Dashboard({ onBack }) {
  const [active, setActive]       = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData]           = useState({ revenue: [], clients: [], geo: [], products: [], alerts: [], transactions: [] });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    // Preserve the mapping logic so the backend data fits perfectly into the components
    const norm = (d) => Array.isArray(d) ? d : (d?.data || []);
    Promise.all([
      fetch(`${API}/sales/sales`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/client/customers`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/client/geography`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/client/products`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/client/transactions`).then(r=>r.json()).catch(()=>[]),
    ]).then(([r, c, g, p, t]) => {
      // Map Revenue
      const mappedRevenue = (r && r.monthlyData ? r.monthlyData : []).map(m => ({
        month: m.month.slice(0, 3),
        totalRevenue: m.totalSales,
      }));

      // Map Customers
      const rawClients = norm(c);
      const mappedClients = rawClients.map(user => ({
        name: user.name,
        country: user.country || "Unknown",
        industry: user.occupation || "Finance",
        revenue: Math.floor(Math.random() * 500000) + 100000,
        risk: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        riskScore: Math.floor(Math.random() * 60) + 40,
        riskProfile: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)]
      }));

      // Map Geography
      const mappedGeo = norm(g).map(loc => ({
        country: loc.id,
        totalExposure: loc.value * 12500000, 
        clientCount: loc.value
      }));

      // Map Products
      const catMap = {};
      norm(p).forEach(prod => {
        const stat = prod.stat && prod.stat[0] ? prod.stat[0] : {};
        const rev = stat.yearlySalesTotal || 0;
        catMap[prod.category || prod.name] = (catMap[prod.category || prod.name] || 0) + rev;
      });
      const mappedProducts = Object.keys(catMap).map(k => ({
        name: k,
        revenue: catMap[k],
      }));

      // Map Transactions
      const mappedTransactions = (t && t.transactions ? t.transactions : []).map(tx => ({
        _id: tx._id,
        client: tx.userId.substring(0, 8),
        cost: parseFloat(tx.cost),
        status: "COMPLETED",
        createdAt: tx.createdAt,
      }));

      // Mock Alerts
      const mockAlerts = [
        { severity: "High", message: "Anomalous transaction volume", client: "GlobalFin", type: "Security" },
        { severity: "Medium", message: "Exposure limit at 90%", client: "EuroRisk", type: "Threshold" },
        { severity: "Low", message: "Compliance scan completed", client: "System", type: "Audit" },
        { severity: "High", message: "Failed login attempt", client: "Admin", type: "Auth" },
      ];

      setData({
        revenue: mappedRevenue,
        clients: mappedClients,
        geo: mappedGeo,
        products: mappedProducts,
        alerts: mockAlerts,
        transactions: mappedTransactions
      });
      setLoading(false);
    });
  }, []);

  const NAV = [
    { label: "Overview",  icon: "◈" },
    { label: "Risk Map",  icon: "◉" },
    { label: "Clients",   icon: "◎" },
    { label: "Analytics", icon: "▣" },
    { label: "Reports",   icon: "▤" },
    { label: "Settings",  icon: "◌" },
  ];

  const renderPage = () => {
    const props = { data, loading };
    switch (active) {
      case "Overview":  return <PageOverview  {...props} />;
      case "Risk Map":  return <PageRiskMap   {...props} />;
      case "Clients":   return <PageClients   {...props} />;
      case "Analytics": return <PageAnalytics {...props} />;
      case "Reports":   return <PageReports   {...props} />;
      case "Settings":  return <PageSettings />;
      default:          return <PageOverview  {...props} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.t1, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        ${FONTS}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:2px}
        ::-webkit-scrollbar-track{background:#000}
        ::-webkit-scrollbar-thumb{background:#181818}
        input::placeholder{color:#333}
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 60, minHeight: "100vh", height: "100vh",
        borderRight: `1px solid ${C.border}`, background: "#000",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, flexShrink: 0, transition: "width 0.2s", zIndex: 50,
      }}>
        <div style={{ padding: sidebarOpen ? "22px 20px" : "22px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center" }}>
          {sidebarOpen && <span style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 14, letterSpacing: "-0.01em", color: C.t1 }}>RiskLens <span style={{ color: C.t4 }}>AI</span></span>}
          <button onClick={() => setSidebarOpen(o=>!o)} style={{ background: "none", border: "none", color: C.t3, fontSize: 14, cursor: "pointer", padding: 4 }}>
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "10px 0" }}>
          {NAV.map(({ label, icon }) => (
            <div key={label} onClick={() => setActive(label)} title={label} style={{
              display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
              padding: sidebarOpen ? "11px 20px" : "11px 0",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              borderLeft: active === label ? `2px solid ${C.t1}` : "2px solid transparent",
              background: active === label ? "#080808" : "transparent",
              color: active === label ? C.t1 : C.t3,
              fontSize: 12, letterSpacing: "0.03em", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 14, minWidth: 20, textAlign: "center" }}>{icon}</span>
              {sidebarOpen && <span style={{ fontFamily: SYNE }}>{label}</span>}
            </div>
          ))}
        </nav>

        {sidebarOpen && onBack && (
          <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
            <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, color: C.t3, padding: "8px 14px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: SYNE, cursor: "pointer", width: "100%" }}>← Home</button>
          </div>
        )}
        <div style={{ padding: sidebarOpen ? "12px 20px" : "12px 0", borderTop: `1px solid ${C.border}`, textAlign: sidebarOpen ? "left" : "center" }}>
          {sidebarOpen && <span style={{ fontSize: 9, color: C.t4, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: SYNE }}>v1.0.0 · Enterprise</span>}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ borderBottom: `1px solid ${C.border}`, padding: "18px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: C.bg, zIndex: 40 }}>
          <div>
            <p style={{ fontSize: 18, fontFamily: SYNE, fontWeight: 800, letterSpacing: "-0.02em", color: C.t1 }}>{active}</p>
            <p style={{ fontSize: 11, color: C.t3, marginTop: 2, fontFamily: MONO }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 10, color: C.lowFg, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: MONO, padding: "6px 14px", border: `1px solid #061510`, background: "#030a06" }}>● Live</div>
            <div style={{ width: 32, height: 32, background: "#0d0d0d", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, fontFamily: SYNE, color: C.t1 }}>MG</div>
          </div>
        </header>

        <main style={{ padding: "32px 36px", flex: 1 }}>
          {renderPage()}
        </main>

        <footer style={{ borderTop: `1px solid ${C.border}`, padding: "14px 36px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, color: C.t4, fontFamily: SYNE, letterSpacing: "0.1em", textTransform: "uppercase" }}>RiskLens AI · Enterprise Risk Analytics</span>
          <span style={{ fontSize: 9, color: C.t4, fontFamily: SYNE, letterSpacing: "0.1em" }}>© {new Date().getFullYear()} · All Rights Reserved</span>
        </footer>
      </div>
    </div>
  );
}
