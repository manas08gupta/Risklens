const levelFromScore = (score) => {
  if (score >= 76) return "High";
  if (score >= 51) return "Medium";
  return "Low";
};

const concernWeights = {
  competition: { market: 18, growth: 8 },
  scaling: { operations: 20, growth: 14 },
  regulations: { compliance: 24 },
  monetization: { market: 14, growth: 12 },
  "customer acquisition": { market: 18, growth: 8 },
  "AI reliability": { ai: 22, operations: 10 },
  "operational costs": { operations: 18, growth: 10 },
};

const stageAdjustments = {
  Idea: { market: 14, growth: 18, compliance: 4, ai: 4, operations: 8 },
  "Pre-seed": { market: 12, growth: 16, compliance: 5, ai: 5, operations: 10 },
  Seed: { market: 10, growth: 14, compliance: 6, ai: 6, operations: 12 },
  "Series A": { market: 8, growth: 12, compliance: 8, ai: 8, operations: 12 },
  "Series B+": { market: 7, growth: 10, compliance: 9, ai: 9, operations: 11 },
  Growth: { market: 6, growth: 8, compliance: 10, ai: 10, operations: 10 },
};

const sensitivityAdjustments = {
  healthcare: { ai: 16, compliance: 22 },
  finance: { ai: 14, compliance: 20 },
  legal: { ai: 14, compliance: 18 },
  education: { ai: 10, compliance: 14 },
  none: { ai: 0, compliance: 0 },
};

const industryBenchmarks = {
  "B2B SaaS": { benchmark: "Healthy SaaS risk posture", pressure: "Moderate GTM crowding" },
  Fintech: { benchmark: "Heightened compliance baseline", pressure: "Trust and regulatory rigor" },
  Healthcare: { benchmark: "Clinical trust threshold is high", pressure: "Governance and data sensitivity" },
  LegalTech: { benchmark: "Accuracy expectations are unforgiving", pressure: "Reliability and defensibility" },
  EdTech: { benchmark: "Adoption depends on institutional trust", pressure: "Procurement and data handling" },
  "Developer Tools": { benchmark: "Switching costs can help retention", pressure: "Crowded category velocity" },
  Cybersecurity: { benchmark: "Security posture is part of the product", pressure: "Credibility and proof" },
  "Climate / Energy": { benchmark: "Long sales cycles increase execution risk", pressure: "Capital intensity" },
  Marketplace: { benchmark: "Liquidity and trust compound risk", pressure: "Supply-demand balance" },
  Consumer: { benchmark: "Growth and retention move together", pressure: "Distribution efficiency" },
};

const sentenceCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);
const API_BASE = import.meta.env.VITE_APP_BASE_URL || "";

export function validateAnalysisStep(stepIndex, form) {
  switch (stepIndex) {
    case 0:
      return {
        startupName: form.startupName ? "" : "Startup name is required.",
        industry: form.industry ? "" : "Select an industry to anchor the benchmark set.",
        startupStage: form.startupStage ? "" : "Startup stage is required.",
        businessModel: form.businessModel ? "" : "Business model is required.",
        targetAudience: form.targetAudience ? "" : "Target audience is required.",
      };
    case 1:
      return {
        productDescription: form.productDescription.trim() ? "" : "Describe the product clearly.",
        problemSolved: form.problemSolved.trim() ? "" : "Explain the problem being solved.",
        mainUsers: form.mainUsers.trim() ? "" : "Tell us who uses the product.",
      };
    case 2:
      if (!form.usesAI) return {};
      return {
        aiPurpose: form.aiPurpose.trim() ? "" : "Explain what the AI actually does.",
        sensitiveData: form.sensitiveData ? "" : "Choose whether sensitive data is processed.",
        automatesDecisions: form.automatesDecisions ? "" : "Choose whether the product automates decisions.",
        industrySensitivity: form.industrySensitivity ? "" : "Select the AI sensitivity level.",
      };
    case 3:
      return {
        founderConcerns: form.founderConcerns.length ? "" : "Select at least one founder concern.",
      };
    default:
      return {};
  }
}

function levelFromRiskScore(score) {
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

function toApiPayload(form) {
  return {
    startupName: form.startupName,
    industry: form.industry,
    startupStage: form.startupStage,
    businessModel: form.businessModel,
    targetAudience: form.targetAudience,
    description: form.productDescription,
    problemSolved: form.problemSolved,
    mainUsers: form.mainUsers,
    competitors: form.competitors,
    uniqueAdvantage: form.uniqueAdvantage,
    usesAI: form.usesAI,
    aiPurpose: form.aiPurpose,
    handlesSensitiveData: form.sensitiveData === "yes",
    automatesDecisions: form.automatesDecisions === "yes",
    founderConcerns: form.founderConcerns,
  };
}

function transformApiAnalysis(apiResponse, form) {
  const analysis = apiResponse.analysis;
  const scoreEntries = [
    ["market", "Market Exposure", analysis.marketRisk],
    ["execution", "Execution Risk", analysis.executionRisk],
    ["compliance", "Regulatory Surface", analysis.complianceRisk],
    ["ai", "AI Governance", analysis.aiSafetyRisk],
    ["scalability", "Scaling Readiness", analysis.scalabilityRisk],
    ["monetization", "Monetization Risk", analysis.monetizationRisk],
  ];

  const pillars = scoreEntries.map(([key, title, score]) => ({
    key,
    title,
    score,
    level: levelFromRiskScore(score),
    description: pillarDescription(key, analysis, form),
  }));

  return {
    company: form.startupName || "Untitled Startup",
    overallScore: analysis.overallRiskScore,
    overallLevel: levelFromRiskScore(analysis.overallRiskScore),
    confidenceScore: analysis.confidenceScore,
    narrative: analysis.riskSummary,
    pillars,
    topRisks: analysis.findings.slice(0, 4).map((finding, index) => ({
      title: finding.title,
      level: sentenceCase(finding.severity),
      priority: `P${index + 1}`,
      summary: `${finding.description} ${finding.recommendation}`,
    })),
    strengths: analysis.strengths,
    recommendations: analysis.recommendations.map((item) => ({
      title: item.title,
      priority: item.priority,
      summary: `${item.rationale} ${item.action}`,
    })),
    watchlist: [
      analysis.benchmarkComparison.peerComparison,
      analysis.benchmarkComparison.categoryPressure,
      analysis.benchmarkComparison.defensibilitySignal,
      analysis.benchmarkComparison.uncertainty,
    ],
    benchmarks: [
      { label: "Overall Risk Index", value: `${analysis.overallRiskScore}/100`, tone: levelFromRiskScore(analysis.overallRiskScore) },
      { label: "Confidence Score", value: `${analysis.confidenceScore}/100`, tone: levelFromRiskScore(100 - analysis.confidenceScore) },
      { label: "Investor Readiness", value: `${analysis.investorReadiness.score}/100`, tone: levelFromRiskScore(100 - analysis.investorReadiness.score) },
      { label: "Benchmark Lens", value: analysis.benchmarkComparison.peerComparison, tone: "Low" },
    ],
    metadata: apiResponse.metadata,
  };
}

function pillarDescription(key, analysis, form) {
  const finding = analysis.findings.find((item) => {
    if (key === "ai") return item.category === "ai_safety";
    if (key === "scalability") return item.category === "scalability";
    if (key === "monetization") return item.category === "monetization";
    return item.category === key;
  });

  if (finding) return `${finding.description} ${finding.recommendation}`;
  if (key === "ai") {
    return form.usesAI
      ? "AI risk reflects the reliability, sensitive data, decisioning, and governance surface in the submitted product workflow."
      : "AI governance risk is lower because AI is not currently part of the stated product path.";
  }
  return analysis.riskSummary;
}

export async function requestRiskAnalysis(form) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(form)),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.analysis) {
    throw new Error(body?.error?.message || "Risk analysis failed.");
  }

  return transformApiAnalysis(body, form);
}

export function generateRiskReport(form) {
  const baseScores = {
    market: 34,
    compliance: 26,
    ai: form.usesAI ? 32 : 14,
    operations: 28,
    growth: 30,
  };

  const stage = stageAdjustments[form.startupStage] || {};
  Object.entries(stage).forEach(([key, value]) => {
    baseScores[key] += value;
  });

  if (form.usesAI) {
    baseScores.ai += 10;
    if (form.sensitiveData === "yes") {
      baseScores.ai += 12;
      baseScores.compliance += 10;
    }
    if (form.automatesDecisions === "yes") {
      baseScores.ai += 10;
      baseScores.operations += 6;
      baseScores.compliance += 6;
    }
    const sensitivity = sensitivityAdjustments[form.industrySensitivity] || sensitivityAdjustments.none;
    Object.entries(sensitivity).forEach(([key, value]) => {
      baseScores[key] += value;
    });
  }

  form.founderConcerns.forEach((concern) => {
    const weight = concernWeights[concern] || {};
    Object.entries(weight).forEach(([key, value]) => {
      baseScores[key] += value;
    });
  });

  if (form.businessModel === "Enterprise contracts") {
    baseScores.market += 6;
    baseScores.growth += 8;
  }

  if (form.businessModel === "Marketplace take-rate") {
    baseScores.operations += 8;
    baseScores.growth += 6;
  }

  if (form.targetAudience === "Enterprise" || form.targetAudience === "Regulated institutions") {
    baseScores.compliance += 6;
    baseScores.market += 4;
  }

  if (form.competitors.trim()) {
    baseScores.market += 4;
  }

  if (form.uniqueAdvantage.trim()) {
    baseScores.market -= 4;
    baseScores.growth -= 2;
  }

  const normalizedScores = Object.fromEntries(
    Object.entries(baseScores).map(([key, value]) => [key, Math.max(18, Math.min(92, value))])
  );

  const overallScore = Math.round(
    (normalizedScores.market + normalizedScores.compliance + normalizedScores.ai + normalizedScores.operations + normalizedScores.growth) / 5
  );

  const overallLevel = levelFromScore(overallScore);
  const benchmark = industryBenchmarks[form.industry] || { benchmark: "Balanced early-stage risk profile", pressure: "Execution clarity" };

  const pillars = [
    {
      key: "market",
      title: "Market Exposure",
      score: normalizedScores.market,
      description: form.founderConcerns.includes("competition")
        ? "Competitive pressure is already top-of-mind, so differentiation and category velocity are important watchpoints."
        : "Market posture is shaped by positioning clarity, buyer urgency, and how crowded the category feels.",
    },
    {
      key: "growth",
      title: "Scaling Readiness",
      score: normalizedScores.growth,
      description: form.founderConcerns.includes("scaling")
        ? "Scaling risk is elevated because team, distribution, and delivery demands may outrun current operating leverage."
        : "Growth readiness reflects go-to-market repeatability, onboarding friction, and revenue maturity.",
    },
    {
      key: "compliance",
      title: "Regulatory Surface",
      score: normalizedScores.compliance,
      description: form.usesAI
        ? "The regulatory surface is influenced by AI usage, buyer profile, and whether decisions or sensitive data are involved."
        : "Even without AI, customer profile and company stage shape the trust and compliance burden.",
    },
    {
      key: "ai",
      title: "AI Governance",
      score: normalizedScores.ai,
      description: form.usesAI
        ? "AI risk depends on model responsibility, transparency, safety controls, and operational fallback plans."
        : "AI governance risk stays relatively low because the product is not currently AI-dependent.",
    },
    {
      key: "operations",
      title: "Operational Resilience",
      score: normalizedScores.operations,
      description: "Operational resilience reflects dependency risk, process maturity, team throughput, and unit-cost stability.",
    },
  ].map((pillar) => ({
    ...pillar,
    level: levelFromScore(pillar.score),
  }));

  const sortedPillars = [...pillars].sort((a, b) => b.score - a.score);
  const topRisks = sortedPillars.slice(0, 3).map((pillar, index) => ({
    title: pillar.title,
    level: pillar.level,
    priority: `P${index + 1}`,
    summary: pillar.description,
  }));

  const strengths = [
    form.uniqueAdvantage.trim()
      ? `Defensible angle: ${form.uniqueAdvantage.trim()}.`
      : "Clearer defensibility would immediately improve market confidence.",
    form.mainUsers.trim()
      ? `User definition is reasonably concrete: ${form.mainUsers.trim()}.`
      : "Sharper user clarity would strengthen go-to-market precision.",
    benchmark.benchmark,
  ];

  const recommendations = [
    normalizedScores.market >= 60
      ? "Tighten messaging around why the buyer should switch now, not later."
      : "Use your market narrative to turn category clarity into commercial momentum.",
    normalizedScores.growth >= 60
      ? "Document repeatable onboarding and delivery workflows before the next growth push."
      : "Codify what is already working so scale does not dilute product quality.",
    form.usesAI
      ? "Establish an AI governance checklist covering data provenance, human review, and incident handling."
      : "Keep an explicit policy for future AI expansion so governance can scale intentionally.",
    normalizedScores.compliance >= 60
      ? "Prepare lightweight trust artifacts early: data handling notes, model boundaries, and decision accountability."
      : "Turn trust posture into a sales asset before larger buyers ask for it.",
  ];

  const watchlist = [
    form.founderConcerns.length
      ? `Founder focus cluster: ${form.founderConcerns.map(sentenceCase).join(", ")}.`
      : "No founder concern cluster captured.",
    form.competitors.trim()
      ? `Competitive context includes ${form.competitors.trim()}.`
      : "Competitive context was not provided, which limits rivalry calibration.",
    form.usesAI && form.sensitiveData === "yes"
      ? "Sensitive data handling raises trust and compliance expectations."
      : "Sensitive-data exposure appears contained at the current product definition.",
  ];

  const benchmarks = [
    { label: "Overall Risk Index", value: `${overallScore}/100`, tone: overallLevel },
    { label: "Benchmark Lens", value: benchmark.benchmark, tone: "Low" },
    { label: "Primary Pressure", value: benchmark.pressure, tone: sortedPillars[0].level },
    { label: "AI Exposure", value: form.usesAI ? sentenceCase(form.industrySensitivity || "none") : "No AI in product path", tone: form.usesAI ? levelFromScore(normalizedScores.ai) : "Low" },
  ];

  const narrative = `${form.startupName || "This startup"} is operating in ${form.industry || "its category"} at the ${form.startupStage || "current"} stage. The strongest risk signal today sits in ${sortedPillars[0].title.toLowerCase()}, while the best leverage point is tightening operational confidence around the current growth story.`;

  return {
    company: form.startupName || "Untitled Startup",
    overallScore,
    overallLevel,
    narrative,
    pillars,
    topRisks,
    strengths,
    recommendations,
    watchlist,
    benchmarks,
  };
}
