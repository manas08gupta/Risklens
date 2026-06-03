export const theme = {
  C: {
    bg: "#000000",
    surface: "#050505",
    surface2: "#080808",
    border: "#171717",
    borderHi: "#2a2a2a",
    t1: "#ffffff",
    t2: "#d6d6d6",
    t3: "#8d8d8d",
    t4: "#505050",
    highBg: "#2a0808",
    highFg: "#ff7070",
    medBg: "#1e1600",
    medFg: "#f0c050",
    lowBg: "#051510",
    lowFg: "#50d090",
  },
  SYNE: "'Syne', sans-serif",
  MONO: "'IBM Plex Mono', monospace",
};

export const riskTone = (level) => {
  if (level === "High" || level === "high") return "high";
  if (level === "Medium" || level === "medium") return "medium";
  return "low";
};
