import { useState, useEffect, useRef } from "react";

const TICKER_ITEMS = [
  "Risk Monitoring", "KPI Tracking", "Data Visualization",
  "Client Analytics", "Transaction Intelligence", "Portfolio Insights",
  "Geo Risk Mapping", "Performance Benchmarking", "Workforce Analytics",
  "Compliance Dashboard", "Real-Time Alerts", "Executive Reporting",
];

const STATS = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "2.4M+", label: "Data Points Processed" },
  { value: "340ms", label: "Average Query Time" },
  { value: "128+", label: "Risk Metrics Tracked" },
];

const FEATURES = [
  {
    tag: "Data Intelligence",
    title: "Real-Time\nRisk Monitoring",
    desc: "Live dashboards surface emerging risks across portfolios the moment data changes — no manual refresh, no lag.",
  },
  {
    tag: "Spatial Analytics",
    title: "Geographic\nExposure Maps",
    desc: "Visualize risk concentration by region, country, and asset class. Spot clusters before they become crises.",
  },
  {
    tag: "Performance",
    title: "Client &\nPortfolio Insights",
    desc: "Unified views across all client accounts. Track revenue, exposure, and performance against benchmarks.",
  },
  {
    tag: "Enterprise Auth",
    title: "Role-Based\nAccess Control",
    desc: "Granular permissions ensure analysts, managers, and executives see exactly what they need — nothing more.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      overflow: "hidden", borderTop: "1px solid #222", borderBottom: "1px solid #222",
      padding: "18px 0", margin: "80px 0",
    }}>
      <div style={{
        display: "flex", gap: "60px", animation: "ticker 28s linear infinite",
        width: "max-content",
      }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "'Syne', sans-serif", fontSize: "13px", letterSpacing: "0.15em",
            textTransform: "uppercase", color: i % 2 === 0 ? "#fff" : "#444",
            whiteSpace: "nowrap",
          }}>
            {item} <span style={{ color: "#333", marginLeft: "20px" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StatCard({ value, label, delay }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      borderLeft: "1px solid #222", paddingLeft: "28px",
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 5vw, 56px)",
        fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em",
      }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#555", marginTop: "8px", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}

function FeatureCard({ tag, title, desc, index }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const delay = (index % 2) * 0.15;
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s, border-color 0.2s ease`,
      border: `1px solid ${hovered ? "#333" : "#1a1a1a"}`, padding: "40px 36px",
      display: "flex", flexDirection: "column", gap: "20px",
      background: "#050505",
      cursor: "default",
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        fontFamily: "'Syne', sans-serif", fontSize: "11px", letterSpacing: "0.2em",
        textTransform: "uppercase", color: "#444", fontWeight: 600,
      }}>{tag}</span>
      <h3 style={{
        fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 2.5vw, 30px)",
        fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2,
        whiteSpace: "pre-line", letterSpacing: "-0.02em",
      }}>{title}</h3>
      <p style={{ fontSize: "15px", color: "#555", lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

function RevealText({ children, delay = 0, size = "clamp(48px, 8vw, 96px)" }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: size,
        fontWeight: 800, color: "#fff", lineHeight: 1.05,
        letterSpacing: "-0.03em",
        transform: inView ? "translateY(0)" : "translateY(100%)",
        opacity: inView ? 1 : 0,
        transition: `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity 0.6s ease ${delay}s`,
      }}>
        {children}
      </div>
    </div>
  );
}

function NavLink({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a href="#" style={{ fontSize: "13px", color: hovered ? "#fff" : "#555", letterSpacing: "0.03em", transition: "color 0.2s" }}
      onClick={e => e.preventDefault()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {children}
    </a>
  );
}

function PrimaryButton({ children, onClick, style = {} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} style={{
      background: hovered ? "#ddd" : "#fff", color: "#000", border: "none", padding: "10px 20px",
      fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "13px",
      cursor: "pointer", letterSpacing: "0.03em", transition: "background 0.2s",
      ...style
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {children}
    </button>
  );
}

const GlobalStyles = () => (
  <style>{`
    @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #000; }
    ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
    a { text-decoration: none; color: inherit; }
  `}</style>
);

function Nav({ onEnter }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "24px 48px",
      borderBottom: scrollY > 60 ? "1px solid #111" : "1px solid transparent",
      background: scrollY > 60 ? "rgba(0,0,0,0.92)" : "transparent",
      backdropFilter: scrollY > 60 ? "blur(12px)" : "none",
      transition: "all 0.4s ease",
    }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.01em" }}>
        RiskLens <span style={{ color: "#333" }}>AI</span>
      </div>
      <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
        {["Platform", "Analytics", "Enterprise", "Docs"].map(item => (
          <NavLink key={item}>{item}</NavLink>
        ))}
        <PrimaryButton onClick={onEnter}>Open Dashboard →</PrimaryButton>
      </div>
    </nav>
  );
}

function Hero({ onEnter }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroScale = Math.max(0.92, 1 - scrollY / 4000);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "flex-end", padding: "0 48px 80px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        opacity: 0.4,
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
      }} />
      <div style={{
        position: "relative", zIndex: 1,
        opacity: heroOpacity,
        transform: `scale(${heroScale})`,
        transformOrigin: "bottom left",
        transition: "none",
      }}>
        <div style={{ animation: "fadeUp 0.8s ease 0.1s both" }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: "11px", letterSpacing: "0.25em",
            textTransform: "uppercase", color: "#444", display: "block", marginBottom: "32px",
          }}>
            Enterprise Risk Intelligence Platform ✦ Built on MERN
          </span>
        </div>
        <div style={{ marginBottom: "40px" }}>
          <RevealText delay={0.1}>Risk Analytics,</RevealText>
          <RevealText delay={0.2}>
            <span style={{ color: "#333" }}>Redefined</span> for
          </RevealText>
          <RevealText delay={0.3}>the Enterprise.</RevealText>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "32px",
          animation: "fadeUp 0.8s ease 0.7s both",
        }}>
          <PrimaryButton onClick={onEnter} style={{ padding: "16px 32px", fontSize: "14px", letterSpacing: "0.05em" }}>
            Enter Dashboard →
          </PrimaryButton>
          <span style={{ fontSize: "13px", color: "#444" }}>
            Full-stack · MongoDB · JWT Auth · Nivo Charts
          </span>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ onEnter }) {
  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <Nav onEnter={onEnter} />
      <Hero onEnter={onEnter} />

      {/* TICKER */}
      <Ticker />

      {/* STATS */}
      <section style={{ padding: "80px 48px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
        }}>
          {STATS.map((s, i) => <StatCard key={i} {...s} delay={i * 0.1} />)}
        </div>
      </section>

      {/* SECTION BREAK */}
      <div style={{ borderTop: "1px solid #111", margin: "0 48px" }} />

      {/* FEATURES HEADING */}
      <section style={{ padding: "100px 48px 60px" }}>
        <RevealText size="clamp(13px, 1.2vw, 15px)" delay={0}>
          <span style={{ color: "#444", fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "12px" }}>
            Platform Capabilities
          </span>
        </RevealText>
        <div style={{ marginTop: "24px" }}>
          <RevealText delay={0.1} size="clamp(36px, 5vw, 64px)">Built for the</RevealText>
          <RevealText delay={0.2} size="clamp(36px, 5vw, 64px)">
            <span style={{ color: "#333" }}>complexity</span> of
          </RevealText>
          <RevealText delay={0.3} size="clamp(36px, 5vw, 64px)">enterprise risk.</RevealText>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: "0 48px 120px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1px", background: "#111",
          border: "1px solid #111",
        }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
        </div>
      </section>

      {/* BIG CTA */}
      <section style={{ padding: "120px 48px", borderTop: "1px solid #111" }}>
        <RevealText delay={0}>The data is live.</RevealText>
        <RevealText delay={0.15}>
          <span style={{ color: "#333" }}>The insights</span> are instant.
        </RevealText>
        <RevealText delay={0.3}>The risk is yours to own.</RevealText>

        <div style={{
          marginTop: "60px", animation: "fadeUp 0.8s ease 0.5s both",
          display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap",
        }}>
          <PrimaryButton onClick={onEnter} style={{ padding: "18px 40px", fontSize: "15px", letterSpacing: "0.05em" }}>
            Open Dashboard →
          </PrimaryButton>
          <span style={{ fontSize: "13px", color: "#333" }}>No setup required. Live data.</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid #111", padding: "40px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px",
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "14px" }}>
          RiskLens AI <span style={{ color: "#222" }}>✦</span>
        </div>
        <div style={{ fontSize: "12px", color: "#333", letterSpacing: "0.05em" }}>
          React · Node.js · Express · MongoDB · JWT · Nivo
        </div>
        <div style={{ fontSize: "12px", color: "#222" }}>© 2025 Manas Gupta</div>
      </footer>
    </div>
  );
}
