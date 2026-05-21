import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  benchmarkRows,
  governanceRings,
  makeVisualizationData,
  projectionEvents,
  volatilityNodes,
} from "./data";
import { chartReveal, reveal, stagger } from "./motion";

const fmt = (n) => {
  if (!n || Number.isNaN(n)) return "$0";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
};

function useCountUp(value, active, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, value]);

  return display;
}

function useInViewOnce(threshold = 0.2) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, active];
}

function SectionShell({ id, kicker, title, copy, children, layout }) {
  return (
    <motion.section
      id={id}
      className="viz-section"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: layout.isMobile ? 0.12 : 0.28 }}
    >
      <motion.div variants={reveal} className="viz-section-copy">
        <span>{kicker}</span>
        <h2>{title}</h2>
        <p>{copy}</p>
      </motion.div>
      <motion.div variants={reveal}>{children}</motion.div>
    </motion.section>
  );
}

function MetricTile({ label, value, suffix = "", hint, tone = "white" }) {
  const [ref, active] = useInViewOnce();
  const count = useCountUp(value, active);

  return (
    <motion.div ref={ref} className={`viz-tile viz-tone-${tone}`} variants={reveal}>
      <div className="viz-tile-top">
        <span>{label}</span>
        <i />
      </div>
      <strong>{count}{suffix}</strong>
      <p>{hint}</p>
    </motion.div>
  );
}

function Panel({ children, className = "" }) {
  return <div className={`viz-panel ${className}`}>{children}</div>;
}

function MiniTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="viz-tooltip">
      <span>{label}</span>
      {payload.map((item) => (
        <p key={item.dataKey}>{item.name || item.dataKey}: {item.value > 9999 ? fmt(item.value) : item.value}</p>
      ))}
    </div>
  );
}

function OrbitalMap({ C }) {
  return (
    <Panel className="viz-orbital-panel">
      <div className="viz-orbit-center">
        <span>Composite</span>
        <strong>76</strong>
      </div>
      {volatilityNodes.map((node, index) => (
        <motion.div
          key={node.label}
          className={`viz-node viz-node-${node.tone}`}
          style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.size, height: node.size }}
          initial={{ opacity: 0, scale: 0.65 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.55 }}
        >
          <span>{node.label}</span>
        </motion.div>
      ))}
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <motion.path variants={chartReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} d="M18 34 C39 21, 63 42, 78 24 S27 72, 58 74" fill="none" stroke={C.t3} strokeWidth="0.25" strokeDasharray="1 2" />
      </svg>
    </Panel>
  );
}

function Gauge({ value, label }) {
  const data = [{ name: label, value, fill: "#ffffff" }];
  return (
    <div className="viz-gauge">
      <ResponsiveContainer width="100%" height={118}>
        <RadialBarChart data={data} startAngle={210} endAngle={-30} innerRadius="72%" outerRadius="100%">
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#111" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function VisualizationExperience({ data, loading, layout, theme }) {
  const { C, SYNE, MONO } = theme;
  const rootRef = useRef(null);
  const viz = useMemo(() => makeVisualizationData(data), [data]);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 20, mass: 0.4 });
  const glowY = useTransform(smoothProgress, [0, 1], ["6%", "78%"]);
  const glowX = useTransform(smoothProgress, [0, 0.5, 1], ["68%", "42%", "76%"]);

  const chartData = viz.revenue.length
    ? viz.revenue
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => ({ month, value: 420000 + index * 84000, forecast: 460000 + index * 92000 }));

  const latestSync = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return <div className="viz-loading">Building visualization surface...</div>;
  }

  return (
    <div ref={rootRef} className="viz-root" style={{ "--syne": SYNE, "--mono": MONO, "--t1": C.t1, "--t2": C.t2, "--t3": C.t3, "--t4": C.t4, "--border": C.border }}>
      <style>{`
        .viz-root{position:relative;min-height:100vh;isolation:isolate}
        .viz-progress{position:fixed;top:0;left:0;height:2px;background:#fff;transform-origin:left;z-index:70}
        .viz-glow{position:fixed;width:44vw;height:44vw;min-width:360px;min-height:360px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.105),rgba(255,255,255,.03) 34%,transparent 68%);filter:blur(10px);pointer-events:none;z-index:-1}
        .viz-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:72px 72px;mask-image:radial-gradient(ellipse 80% 70% at 50% 18%,black,transparent 78%);opacity:.42;pointer-events:none;z-index:-2}
        .viz-hero{min-height:min(820px,calc(100svh - 88px));display:grid;align-items:end;padding:clamp(44px,7vw,92px) 0 clamp(42px,7vw,84px)}
        .viz-hero-inner{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.7fr);gap:clamp(28px,5vw,70px);align-items:end}
        .viz-kicker,.viz-section-copy span,.viz-tile-top span,.viz-panel-label{font-family:var(--syne);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--t3)}
        .viz-hero h1{font-family:var(--syne);font-size:clamp(46px,7vw,108px);line-height:.96;letter-spacing:0;color:#fff;margin:22px 0 24px;max-width:980px}
        .viz-hero h1 em{font-style:normal;color:#3a3a3a}
        .viz-hero p,.viz-section-copy p{font-size:15px;line-height:1.8;color:#777;max-width:620px}
        .viz-hero-meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
        .viz-chip{border:1px solid var(--border);background:#050505;padding:9px 12px;font-family:var(--mono);font-size:10px;color:var(--t3)}
        .viz-hero-card{min-height:420px;position:relative;overflow:hidden}
        .viz-panel{border:1px solid var(--border);background:linear-gradient(180deg,rgba(10,10,10,.96),rgba(3,3,3,.96));padding:clamp(18px,2.2vw,28px);min-width:0;position:relative}
        .viz-panel:before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.055),transparent 34%);opacity:.55;pointer-events:none}
        .viz-panel>*{position:relative;z-index:1}
        .viz-section{scroll-margin-top:96px;display:grid;grid-template-columns:minmax(220px,.42fr) minmax(0,1fr);gap:clamp(22px,4vw,58px);padding:clamp(64px,9vw,126px) 0;border-top:1px solid rgba(255,255,255,.07)}
        .viz-section-copy{position:sticky;top:104px;align-self:start}
        .viz-section-copy h2{font-family:var(--syne);font-size:clamp(28px,3.8vw,54px);line-height:1.03;letter-spacing:0;color:#fff;margin:14px 0 18px}
        .viz-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:#141414;border:1px solid #141414}
        .viz-tile{background:#050505;padding:22px;min-height:178px;display:flex;flex-direction:column;justify-content:space-between}
        .viz-tile-top{display:flex;justify-content:space-between;gap:14px;align-items:center}
        .viz-tile-top i{width:6px;height:6px;border-radius:999px;background:#fff;box-shadow:0 0 18px rgba(255,255,255,.5)}
        .viz-tile strong{font-family:var(--syne);font-size:clamp(32px,4vw,54px);line-height:1;color:#fff;letter-spacing:0}
        .viz-tile p{font-family:var(--mono);font-size:11px;line-height:1.55;color:var(--t4)}
        .viz-tone-red .viz-tile-top i{background:#ff7070}.viz-tone-amber .viz-tile-top i{background:#f0c050}.viz-tone-green .viz-tile-top i{background:#50d090}
        .viz-chart-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:1px;background:#141414;border:1px solid #141414;margin-top:1px}
        .viz-tooltip{background:#070707;border:1px solid #1d1d1d;padding:10px 12px;font-family:var(--mono);font-size:10px;color:#fff}.viz-tooltip span{color:#777;display:block;margin-bottom:4px}
        .viz-orbital-panel{min-height:520px;overflow:hidden;background:radial-gradient(circle at 50% 50%,#101010,#030303 62%)}
        .viz-orbital-panel svg{position:absolute;inset:0;width:100%;height:100%;opacity:.9}
        .viz-orbit-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:148px;height:148px;border:1px solid #272727;background:#030303;display:grid;place-items:center;text-align:center;z-index:2}
        .viz-orbit-center strong{font-family:var(--syne);font-size:48px;color:#fff}.viz-orbit-center span{font-family:var(--mono);font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.12em}
        .viz-node{position:absolute;border:1px solid #242424;background:#090909;display:grid;place-items:center;text-align:center;transform:translate(-50%,-50%);border-radius:999px;z-index:3}
        .viz-node span{font-family:var(--mono);font-size:10px;color:#aaa;padding:10px}.viz-node-high{box-shadow:0 0 34px rgba(255,112,112,.12)}.viz-node-medium{box-shadow:0 0 28px rgba(240,192,80,.11)}.viz-node-low{box-shadow:0 0 28px rgba(80,208,144,.1)}
        .viz-governance{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:#141414;border:1px solid #141414}
        .viz-gauge{background:#050505;padding:18px;text-align:center;min-width:0}.viz-gauge strong{display:block;font-family:var(--syne);font-size:28px;color:#fff;margin-top:-28px}.viz-gauge span{font-family:var(--mono);font-size:10px;color:#777}
        .viz-bars{display:grid;gap:16px}.viz-bar{display:grid;grid-template-columns:150px 1fr 38px;gap:14px;align-items:center;font-family:var(--mono);font-size:11px;color:#777}.viz-track{height:8px;background:#101010;position:relative;overflow:hidden}.viz-track i{position:absolute;inset:0 auto 0 0;background:#fff}.viz-track b{position:absolute;inset:2px auto 2px 0;background:#333}
        .viz-split{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#141414;border:1px solid #141414}
        .viz-status-list{display:grid;gap:13px}.viz-status{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #151515;padding-bottom:13px}.viz-status p{font-size:13px;color:#ddd}.viz-status span{font-family:var(--mono);font-size:10px;color:#666}
        .viz-timeline{display:grid;gap:0;border:1px solid #141414}.viz-event{display:grid;grid-template-columns:90px 1fr;gap:24px;padding:24px;background:#050505;border-bottom:1px solid #141414}.viz-event strong{font-family:var(--syne);font-size:18px;color:#fff}.viz-event p{font-size:14px;color:#777;line-height:1.7}
        .viz-wall{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:#141414;border:1px solid #141414}.viz-note{background:#050505;padding:22px;min-height:180px}.viz-note span{font-family:var(--mono);font-size:10px;color:#666}.viz-note p{font-size:14px;color:#ddd;line-height:1.65;margin-top:18px}
        .viz-loading{border:1px solid #151515;background:#050505;padding:28px;color:#777;font-family:var(--mono)}
        @media (max-width:1100px){.viz-hero-inner,.viz-section,.viz-chart-grid,.viz-split{grid-template-columns:1fr}.viz-section-copy{position:relative;top:auto}.viz-metrics,.viz-governance,.viz-wall{grid-template-columns:repeat(2,minmax(0,1fr))}.viz-hero-card{min-height:360px}}
        @media (max-width:720px){.viz-hero{min-height:auto;padding:48px 0}.viz-hero h1{font-size:clamp(40px,14vw,64px)}.viz-metrics,.viz-governance,.viz-wall{grid-template-columns:1fr}.viz-section{padding:56px 0;scroll-margin-top:82px}.viz-bar{grid-template-columns:1fr}.viz-event{grid-template-columns:1fr;gap:8px}.viz-panel{padding:18px}.viz-orbital-panel{min-height:420px}.viz-node{width:72px!important;height:72px!important}.viz-orbit-center{width:120px;height:120px}.viz-orbit-center strong{font-size:38px}}
      `}</style>
      <motion.div className="viz-progress" style={{ scaleX: smoothProgress, right: 0 }} />
      <motion.div className="viz-glow" style={{ top: glowY, left: glowX }} />
      <div className="viz-grid" />

      <section className="viz-hero" id="visualization">
        <div className="viz-hero-inner">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.span variants={reveal} className="viz-kicker">Visualization of Random Data / Live Demo Surface</motion.span>
            <motion.h1 variants={reveal}>Random data, <em>structured</em> like conviction.</motion.h1>
            <motion.p variants={reveal}>
              A cinematic intelligence playground for startup risk, AI governance, infrastructure pressure, and investor confidence. The numbers are synthetic; the product behavior is intentionally premium.
            </motion.p>
            <motion.div variants={reveal} className="viz-hero-meta">
              <span className="viz-chip">sync {latestSync} IST</span>
              <span className="viz-chip">stream stable</span>
              <span className="viz-chip">confidence {viz.investorConfidence}%</span>
            </motion.div>
          </motion.div>
          <motion.div variants={reveal} initial="hidden" animate="visible">
            <Panel className="viz-hero-card">
              <span className="viz-panel-label">Signal Trajectory</span>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 28, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vizHeroGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fff" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#111" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={48} />
                  <Tooltip content={<MiniTooltip />} />
                  <Area type="monotone" dataKey="forecast" stroke="#555" fill="transparent" strokeDasharray="3 5" dot={false} />
                  <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={1.6} fill="url(#vizHeroGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Panel>
          </motion.div>
        </div>
      </section>

      <SectionShell id="overview" kicker="01 / Executive Metrics" title="The readout starts as a board memo." copy="A tight executive layer turns noisy random inputs into a believable system state: money, risk, runway, governance." layout={layout}>
        <div className="viz-metrics">
          <MetricTile label="Synthetic AUM" value={Math.round(viz.totalRevenue / 100000) || 98} suffix={viz.totalRevenue ? "x" : ""} hint={viz.totalRevenue ? "Scaled demo multiple" : "Random portfolio proxy"} />
          <MetricTile label="Average Risk" value={viz.avgRisk} hint="Composite exposure score" tone="amber" />
          <MetricTile label="High Risk" value={viz.highRisk} hint="Entities above review threshold" tone="red" />
          <MetricTile label="Runway Index" value={viz.runwayIndex} hint="Synthetic resilience model" tone="green" />
        </div>
      </SectionShell>

      <SectionShell id="ecosystem" kicker="02 / Risk Ecosystem" title="Exposure becomes spatial, not tabular." copy="The old risk map is reinterpreted as a living field of pressure points with subtle depth and a readable center of gravity." layout={layout}>
        <OrbitalMap C={C} />
      </SectionShell>

      <SectionShell id="governance" kicker="03 / AI Governance" title="Controls are measured like product telemetry." copy="Governance is shown as a control plane, with each ring indicating operational readiness rather than a static checklist." layout={layout}>
        <div className="viz-governance">
          {governanceRings.map((ring) => <Gauge key={ring.label} {...ring} />)}
        </div>
      </SectionShell>

      <SectionShell id="benchmarks" kicker="04 / Startup Benchmarks" title="The company is compared against a moving peer shadow." copy="Benchmark bars reveal the startup’s signal against a muted peer band, designed for quick investor-demo scanning." layout={layout}>
        <Panel>
          <div className="viz-bars">
            {benchmarkRows.map((row, index) => (
              <div className="viz-bar" key={row.name}>
                <span>{row.name}</span>
                <div className="viz-track">
                  <motion.b initial={{ width: 0 }} whileInView={{ width: `${row.peer}%` }} viewport={{ once: true }} transition={{ delay: index * 0.06, duration: 0.8 }} />
                  <motion.i initial={{ width: 0 }} whileInView={{ width: `${row.value}%` }} viewport={{ once: true }} transition={{ delay: 0.16 + index * 0.06, duration: 0.9 }} />
                </div>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </SectionShell>

      <SectionShell id="prediction" kicker="05 / Predictive Analytics" title="Forecasts feel live without becoming loud." copy="Revenue, risk, and confidence projections share a restrained charting language that matches the existing product." layout={layout}>
        <div className="viz-chart-grid">
          <Panel>
            <span className="viz-panel-label">Predictive Revenue Band</span>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 28, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={48} />
                <Tooltip content={<MiniTooltip />} />
                <Line type="monotone" dataKey="forecast" stroke="#666" strokeDasharray="4 5" dot={false} />
                <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={1.8} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
          <Panel>
            <div className="viz-status-list">
              {["Monte Carlo drift stable", "Infra stress pulse complete", "Outlier scan queued", "Founder readiness rising"].map((item, index) => (
                <div className="viz-status" key={item}>
                  <p>{item}</p>
                  <span>{index === 2 ? "queued" : "ok"}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </SectionShell>

      <SectionShell id="confidence" kicker="06 / Investor Confidence" title="Readiness is scored as a compound narrative." copy="Founder clarity, market timing, AI risk posture, and infrastructure maturity converge into a single confidence surface." layout={layout}>
        <div className="viz-split">
          <Panel>
            <MetricTile label="Investor Confidence" value={viz.investorConfidence} suffix="%" hint="Weighted synthetic conviction score" tone="green" />
          </Panel>
          <Panel>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={benchmarkRows.slice(0, 4)} layout="vertical" margin={{ top: 4, right: 8, left: 12, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#777", fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} width={118} />
                <Tooltip content={<MiniTooltip />} />
                <Bar dataKey="value" fill="#fff" radius={[0, 3, 3, 0]} barSize={9} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </SectionShell>

      <SectionShell id="timeline" kicker="07 / Timeline Projection" title="The scroll resolves into a forward operating plan." copy="The narrative becomes temporal: current state, near-term movement, and projected confidence windows." layout={layout}>
        <div className="viz-timeline">
          {projectionEvents.map(([date, event], index) => (
            <motion.div className="viz-event" key={date} initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <strong>{date}</strong>
              <p>{event}</p>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="wall" kicker="08 / Advanced Insights Wall" title="The system ends with small, specific signals." copy="Tiny status labels, timestamps, and micro-insights make the surface feel operational instead of decorative." layout={layout}>
        <div className="viz-wall">
          {[
            ["Anomaly", "Governance velocity outpaces peer median by 14 points after the synthetic policy patch."],
            ["Signal", "Founder readiness rises when infrastructure and compliance deltas are viewed together."],
            ["Watch", "Model-drift exposure remains the only red-band pressure point in this random run."],
            ["Pulse", "Investor memo quality index refreshed from 128 synthetic observations."],
            ["Latency", "Analytics surface rendered under target interaction budget on current viewport."],
            ["Export", "Board-ready storyline available after final review pass."],
          ].map(([label, note], index) => (
            <motion.div className="viz-note" key={label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
              <span>{label} / {latestSync}</span>
              <p>{note}</p>
            </motion.div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}
