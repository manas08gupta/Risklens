import { useEffect, useRef, useState } from "react";

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
    desc: "Live dashboards surface emerging risks across portfolios the moment data changes, with no manual refresh and no lag.",
  },
  {
    tag: "Spatial Analytics",
    title: "Geographic\nExposure Maps",
    desc: "Visualize risk concentration by region, country, and asset class so teams can spot clusters before they become crises.",
  },
  {
    tag: "Performance",
    title: "Client &\nPortfolio Insights",
    desc: "Unified views across client accounts help teams track revenue, exposure, and performance against benchmarks in one place.",
  },
  {
    tag: "Enterprise Auth",
    title: "Role-Based\nAccess Control",
    desc: "Granular permissions ensure analysts, managers, and executives see exactly what they need and nothing more.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

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
    isTablet: width < 1024,
  };
}

function Ticker({ compact }) {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid #222",
        borderBottom: "1px solid #222",
        padding: compact ? "14px 0" : "18px 0",
        margin: compact ? "56px 0" : "80px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: compact ? "32px" : "60px",
          animation: "ticker 28s linear infinite",
          width: "max-content",
          paddingLeft: compact ? "16px" : "0",
        }}
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: compact ? "11px" : "13px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: i % 2 === 0 ? "#fff" : "#444",
              whiteSpace: "nowrap",
            }}
          >
            {item} <span style={{ color: "#333", marginLeft: compact ? "14px" : "20px" }}>+</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StatCard({ value, label, delay, compact }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        borderLeft: "1px solid #222",
        paddingLeft: compact ? "18px" : "28px",
      }}
    >
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: compact ? "clamp(32px, 10vw, 46px)" : "clamp(36px, 5vw, 56px)",
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: compact ? "12px" : "13px",
          color: "#555",
          marginTop: "8px",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function FeatureCard({ tag, title, desc, index, compact }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const delay = (index % 2) * 0.15;

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s, border-color 0.2s ease`,
        border: `1px solid ${hovered ? "#333" : "#1a1a1a"}`,
        padding: compact ? "28px 22px" : "40px 36px",
        display: "flex",
        flexDirection: "column",
        gap: compact ? "16px" : "20px",
        background: "#050505",
        cursor: "default",
        minWidth: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#444",
          fontWeight: 600,
        }}
      >
        {tag}
      </span>
      <h3
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: compact ? "clamp(20px, 6vw, 28px)" : "clamp(22px, 2.5vw, 30px)",
          fontWeight: 800,
          color: "#fff",
          margin: 0,
          lineHeight: 1.15,
          whiteSpace: "pre-line",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: compact ? "14px" : "15px", color: "#555", lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

function RevealText({ children, delay = 0, size = "clamp(48px, 8vw, 96px)" }) {
  const [ref, inView] = useInView(0.1);

  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: size,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          transform: inView ? "translateY(0)" : "translateY(100%)",
          opacity: inView ? 1 : 0,
          transition: `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity 0.6s ease ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function NavLink({ children }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="#"
      style={{
        fontSize: "13px",
        color: hovered ? "#fff" : "#555",
        letterSpacing: "0.03em",
        transition: "color 0.2s",
      }}
      onClick={(e) => e.preventDefault()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

function PrimaryButton({ children, onClick, style = {} }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        background: hovered ? "#ddd" : "#fff",
        color: "#000",
        border: "none",
        padding: "12px 20px",
        minHeight: "46px",
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: "13px",
        cursor: "pointer",
        letterSpacing: "0.03em",
        transition: "background 0.2s, transform 0.2s",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

const GlobalStyles = () => (
  <style>{`
    @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { overflow-x: hidden; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #000; }
    ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
    a { text-decoration: none; color: inherit; }
  `}</style>
);

function Nav({ onEnter, isTablet }) {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!isTablet) setMenuOpen(false);
  }, [isTablet]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: isTablet ? "16px 18px" : "24px 48px",
        borderBottom: scrollY > 60 ? "1px solid #111" : "1px solid transparent",
        background: scrollY > 60 ? "rgba(0,0,0,0.92)" : "transparent",
        backdropFilter: scrollY > 60 ? "blur(12px)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.01em" }}>
          RiskLens <span style={{ color: "#333" }}>AI</span>
        </div>

        {isTablet ? (
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid #1e1e1e",
              minWidth: "46px",
              minHeight: "46px",
              padding: "0 14px",
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            Menu
          </button>
        ) : (
          <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
            {["Platform", "Analytics", "Enterprise", "Docs"].map((item) => (
              <NavLink key={item}>{item}</NavLink>
            ))}
            <PrimaryButton onClick={onEnter}>Open Dashboard</PrimaryButton>
          </div>
        )}
      </div>

      {isTablet && menuOpen && (
        <div
          style={{
            marginTop: "14px",
            border: "1px solid #171717",
            background: "rgba(5,5,5,0.98)",
            padding: "14px",
            display: "grid",
            gap: "12px",
          }}
        >
          {["Platform", "Analytics", "Enterprise", "Docs"].map((item) => (
            <NavLink key={item}>{item}</NavLink>
          ))}
          <PrimaryButton onClick={onEnter} style={{ width: "100%", justifySelf: "stretch" }}>
            Open Dashboard
          </PrimaryButton>
        </div>
      )}
    </nav>
  );
}

function Hero({ onEnter, isCompact }) {
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
  const heroScale = Math.max(0.94, 1 - scrollY / 4000);

  return (
    <section
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: isCompact ? "flex-start" : "flex-end",
        padding: isCompact ? "0 18px 32px" : "0 48px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
          backgroundSize: isCompact ? "42px 42px" : "80px 80px",
          opacity: 0.4,
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          opacity: heroOpacity,
          transform: `scale(${heroScale})`,
          transformOrigin: "bottom left",
          transition: "none",
          paddingTop: isCompact ? "86px" : "140px",
          maxWidth: "1120px",
        }}
      >
        <div style={{ animation: "fadeUp 0.8s ease 0.1s both" }}>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#444",
              display: "block",
              marginBottom: isCompact ? "24px" : "32px",
              maxWidth: isCompact ? "240px" : "none",
              lineHeight: 1.6,
            }}
          >
            Enterprise Risk Intelligence Platform + Built on MERN
          </span>
        </div>

        <div style={{ marginBottom: isCompact ? "28px" : "40px", maxWidth: "980px" }}>
          <RevealText delay={0.1} size={isCompact ? "clamp(42px, 14vw, 72px)" : "clamp(58px, 8vw, 96px)"}>
            Risk Analytics,
          </RevealText>
          <RevealText delay={0.2} size={isCompact ? "clamp(42px, 14vw, 72px)" : "clamp(58px, 8vw, 96px)"}>
            <span style={{ color: "#333" }}>Redefined</span> for
          </RevealText>
          <RevealText delay={0.3} size={isCompact ? "clamp(42px, 14vw, 72px)" : "clamp(58px, 8vw, 96px)"}>
            the Enterprise.
          </RevealText>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: isCompact ? "stretch" : "center",
            flexDirection: isCompact ? "column" : "row",
            gap: isCompact ? "14px" : "32px",
            animation: "fadeUp 0.8s ease 0.7s both",
            maxWidth: "780px",
          }}
        >
          <PrimaryButton
            onClick={onEnter}
            style={{
              padding: isCompact ? "14px 20px" : "16px 32px",
              fontSize: "14px",
              letterSpacing: "0.05em",
              width: isCompact ? "100%" : "auto",
            }}
          >
            Enter Dashboard
          </PrimaryButton>
          <span style={{ fontSize: isCompact ? "12px" : "13px", color: "#444", lineHeight: 1.6 }}>
            Full-stack + MongoDB + JWT Auth + Nivo Charts
          </span>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ onEnter }) {
  const { isMobile, isTablet } = useViewport();
  const sectionPadding = isMobile ? "0 18px" : "0 48px";
  const blockPadding = isMobile ? "72px 18px" : "100px 48px";

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <Nav onEnter={onEnter} isTablet={isTablet} />
      <Hero onEnter={onEnter} isCompact={isTablet} />
      <Ticker compact={isTablet} />

      <section style={{ padding: isMobile ? "24px 18px 64px" : "80px 48px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: isMobile ? "28px" : "40px",
          }}
        >
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.1} compact={isTablet} />
          ))}
        </div>
      </section>

      <div style={{ borderTop: "1px solid #111", margin: sectionPadding }} />

      <section style={{ padding: isMobile ? "72px 18px 44px" : "100px 48px 60px" }}>
        <RevealText size="clamp(12px, 1.2vw, 15px)" delay={0}>
          <span
            style={{
              color: "#444",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontSize: "12px",
            }}
          >
            Platform Capabilities
          </span>
        </RevealText>
        <div style={{ marginTop: isMobile ? "18px" : "24px" }}>
          <RevealText delay={0.1} size={isMobile ? "clamp(30px, 11vw, 44px)" : "clamp(36px, 5vw, 64px)"}>
            Built for the
          </RevealText>
          <RevealText delay={0.2} size={isMobile ? "clamp(30px, 11vw, 44px)" : "clamp(36px, 5vw, 64px)"}>
            <span style={{ color: "#333" }}>complexity</span> of
          </RevealText>
          <RevealText delay={0.3} size={isMobile ? "clamp(30px, 11vw, 44px)" : "clamp(36px, 5vw, 64px)"}>
            enterprise risk.
          </RevealText>
        </div>
      </section>

      <section style={{ padding: isMobile ? "0 18px 84px" : "0 48px 120px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1px",
            background: "#111",
            border: "1px solid #111",
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.tag} {...f} index={i} compact={isTablet} />
          ))}
        </div>
      </section>

      <section style={{ padding: blockPadding, borderTop: "1px solid #111" }}>
        <RevealText delay={0} size={isMobile ? "clamp(30px, 11vw, 44px)" : "clamp(48px, 8vw, 96px)"}>
          The data is live.
        </RevealText>
        <RevealText delay={0.15} size={isMobile ? "clamp(30px, 11vw, 44px)" : "clamp(48px, 8vw, 96px)"}>
          <span style={{ color: "#333" }}>The insights</span> are instant.
        </RevealText>
        <RevealText delay={0.3} size={isMobile ? "clamp(30px, 11vw, 44px)" : "clamp(48px, 8vw, 96px)"}>
          The risk is yours to own.
        </RevealText>

        <div
          style={{
            marginTop: isMobile ? "28px" : "60px",
            animation: "fadeUp 0.8s ease 0.5s both",
            display: "flex",
            gap: "16px",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
            maxWidth: "620px",
          }}
        >
          <PrimaryButton
            onClick={onEnter}
            style={{
              padding: isMobile ? "14px 18px" : "18px 40px",
              fontSize: "15px",
              letterSpacing: "0.05em",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Open Dashboard
          </PrimaryButton>
          <span style={{ fontSize: "13px", color: "#333", lineHeight: 1.6 }}>No setup required. Live data.</span>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid #111",
          padding: isMobile ? "28px 18px 36px" : "40px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "14px" }}>
          RiskLens AI <span style={{ color: "#222" }}>+</span>
        </div>
        <div style={{ fontSize: "12px", color: "#333", letterSpacing: "0.05em", lineHeight: 1.6 }}>
          React + Node.js + Express + MongoDB + JWT + Nivo
        </div>
        <div style={{ fontSize: "12px", color: "#222" }}>Copyright 2025 Manas Gupta</div>
      </footer>
    </div>
  );
}
