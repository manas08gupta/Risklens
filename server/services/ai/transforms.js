import { FullAnalysisResponseSchema } from "./schemas.js";

const clampScore = (value, fallback = 50) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, parsed));
};

const cleanText = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value
    .replace(/```(?:json)?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

const fitText = (value, fallback, max, min = 1) => {
  const cleaned = cleanText(value);
  const safe = cleaned.length >= min ? cleaned : fallback;
  return safe.slice(0, max);
};

const allowedSeverity = new Set(["low", "medium", "high"]);
const allowedCategory = new Set(["market", "execution", "compliance", "ai_safety", "scalability", "monetization"]);
const allowedPriority = new Set(["P1", "P2", "P3", "P4"]);
const allowedReadiness = new Set(["weak", "developing", "credible", "strong"]);

export function extractJsonObject(rawText) {
  const text = cleanText(rawText);
  if (!text) throw new Error("Gemini returned an empty response.");

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("No JSON object found in model response.");
    return JSON.parse(text.slice(start, end + 1));
  }
}

export function normalizeAnalysis(candidate, input) {
  const source = candidate && typeof candidate === "object" ? candidate : {};
  const fallbackScores = scoreFromInput(input);
  const scores = {
    marketRisk: clampScore(source.marketRisk, fallbackScores.marketRisk),
    executionRisk: clampScore(source.executionRisk, fallbackScores.executionRisk),
    complianceRisk: clampScore(source.complianceRisk, fallbackScores.complianceRisk),
    aiSafetyRisk: clampScore(source.aiSafetyRisk, fallbackScores.aiSafetyRisk),
    scalabilityRisk: clampScore(source.scalabilityRisk, fallbackScores.scalabilityRisk),
    monetizationRisk: clampScore(source.monetizationRisk, fallbackScores.monetizationRisk),
  };

  const overallRiskScore = clampScore(
    source.overallRiskScore,
    Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length)
  );

  const fallbackFindings = [
    {
      severity: "medium",
      category: "market",
      title: "Positioning clarity requires validation",
      description: `${input.startupName} needs sharper evidence that its target buyers feel enough urgency to switch from existing workflows.`,
      recommendation: "Run structured discovery with target buyers and convert repeated objections into sales and product proof points.",
    },
    {
      severity: input.usesAI ? "high" : "medium",
      category: input.usesAI ? "ai_safety" : "execution",
      title: input.usesAI ? "AI governance surface is active" : "Execution proof is still forming",
      description: input.usesAI
        ? "The product uses AI, so reliability boundaries, human review, data provenance, and incident handling must be explicit."
        : "The current risk profile depends on whether the team can translate product intent into repeatable delivery and adoption.",
      recommendation: input.usesAI
        ? "Create a lightweight AI governance checklist covering evaluation, fallback behavior, escalation, and customer-facing limitations."
        : "Document the operating cadence, onboarding path, and measurable adoption milestones before scaling the motion.",
    },
    {
      severity: "medium",
      category: "monetization",
      title: "Revenue model needs buyer proof",
      description: `The ${input.businessModel} model can work, but investor confidence will depend on evidence that the pricing aligns with customer value.`,
      recommendation: "Test willingness-to-pay with qualified prospects and track conversion friction by segment.",
    },
  ];

  const findings = Array.isArray(source.findings) ? source.findings : [];
  const safeFindings = [...findings, ...fallbackFindings]
    .slice(0, 8)
    .map((finding) => ({
      severity: allowedSeverity.has(finding?.severity) ? finding.severity : "medium",
      category: allowedCategory.has(finding?.category) ? finding.category : "execution",
      title: fitText(finding?.title, "Risk signal requires review", 120, 4),
      description: fitText(finding?.description, "The submitted information indicates a risk area that should be validated before the next fundraising or growth push.", 600, 20),
      recommendation: fitText(finding?.recommendation, "Convert this risk into a clear owner, control, and measurable milestone.", 600, 20),
    }));

  const recommendations = Array.isArray(source.recommendations) ? source.recommendations : [];
  const safeRecommendations = [
    ...recommendations,
    {
      priority: "P1",
      title: "Turn risk into investor evidence",
      rationale: "The fastest way to improve readiness is to make assumptions measurable and reviewable.",
      action: "Create a one-page risk register with owners, controls, dates, and proof artifacts for the top three risks.",
    },
    {
      priority: "P2",
      title: "Sharpen customer validation",
      rationale: "Specific buyer evidence reduces market and monetization uncertainty.",
      action: "Interview target users around urgency, switching costs, procurement friction, and budget ownership.",
    },
    {
      priority: "P3",
      title: "Define operating controls",
      rationale: "Execution confidence rises when quality, delivery, and escalation paths are visible.",
      action: "Document the launch, support, reliability, and review rituals needed for the current stage.",
    },
  ]
    .slice(0, 6)
    .map((item, index) => ({
      priority: allowedPriority.has(item?.priority) ? item.priority : `P${Math.min(index + 1, 4)}`,
      title: fitText(item?.title, "Recommended action", 120, 4),
      rationale: fitText(item?.rationale, "This action reduces investor-facing uncertainty.", 600, 20),
      action: fitText(item?.action, "Assign an owner and create a measurable next step.", 600, 20),
    }));

  const strengths = Array.isArray(source.strengths) ? source.strengths : [];
  const safeStrengths = [
    ...strengths.map((item) => cleanText(item)).filter((item) => item.length >= 10),
    input.uniqueAdvantage ? `Defensibility signal: ${input.uniqueAdvantage}` : "A clearer defensibility claim would improve investor confidence.",
    `The company has a defined target context in ${input.industry} for ${input.targetAudience}.`,
  ].slice(0, 6);

  const normalized = {
    overallRiskScore,
    confidenceScore: clampScore(source.confidenceScore, confidenceFromInput(input)),
    ...scores,
    findings: safeFindings,
    strengths: safeStrengths,
    recommendations: safeRecommendations,
    benchmarkComparison: {
      peerComparison: fitText(source.benchmarkComparison?.peerComparison, `${input.startupName} should be compared against companies with similar stage, buyer complexity, and trust burden.`, 500, 20),
      categoryPressure: fitText(source.benchmarkComparison?.categoryPressure, `${input.industry} risk is shaped by buyer urgency, switching friction, and credible proof.`, 500, 20),
      defensibilitySignal: fitText(source.benchmarkComparison?.defensibilitySignal, input.uniqueAdvantage ? `Defensibility signal: ${input.uniqueAdvantage}` : "Defensibility is not yet fully evidenced from the submitted information.", 500, 20),
      uncertainty: fitText(source.benchmarkComparison?.uncertainty, "The analysis is limited by self-reported product, market, and competitive information.", 500, 20),
    },
    investorReadiness: {
      score: clampScore(source.investorReadiness?.score, Math.max(20, 100 - overallRiskScore)),
      level: allowedReadiness.has(source.investorReadiness?.level) ? source.investorReadiness.level : readinessLevel(Math.max(20, 100 - overallRiskScore)),
      summary: fitText(source.investorReadiness?.summary, `${input.startupName} has a usable risk story, but investor readiness depends on converting the highest-risk assumptions into evidence.`, 600, 20),
    },
    confidenceExplanation: fitText(
      source.confidenceExplanation,
      "Confidence reflects the specificity of the submitted startup context, the presence of competitive detail, and whether the analysis relied on live model output or fallback heuristics.",
      700,
      30
    ),
    assumptions: normalizeStringList(source.assumptions, [
      `${input.startupName} is represented accurately by the submitted founder-provided context.`,
      "Scores should be treated as diligence prompts, not deterministic investment advice.",
      input.competitors ? "Competitor context is self-reported and has not been independently verified." : "Competitive context is incomplete, so market pressure may be under-calibrated.",
    ], 6, 300),
    missingInformation: normalizeStringList(source.missingInformation, [
      "Current traction, retention, pricing, and sales-cycle evidence were not provided.",
      "Customer proof, churn signals, and buyer urgency evidence would materially improve confidence.",
      input.usesAI ? "AI evaluation results, model monitoring details, and human-review policy were not provided." : "Future AI expansion plans were not described.",
    ], 6, 240),
    riskSummary: fitText(
      source.riskSummary,
      `${input.startupName} operates in ${input.industry} at the ${input.startupStage} stage. The most important current risks are tied to market proof, execution readiness, and the trust controls needed for the company's target audience.`,
      1200,
      80
    ),
  };

  return FullAnalysisResponseSchema.parse(normalized);
}

function normalizeStringList(value, fallback, maxItems, maxLength) {
  const input = Array.isArray(value) ? value : [];
  return [...input, ...fallback]
    .map((item) => fitText(item, "", maxLength, 10))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function confidenceFromInput(input) {
  const fields = [
    input.description,
    input.problemSolved,
    input.mainUsers,
    input.competitors,
    input.uniqueAdvantage,
    input.aiPurpose,
  ];
  const detailScore = fields.reduce((score, value) => score + (value && value.length > 40 ? 8 : value ? 4 : 0), 42);
  return clampScore(detailScore + Math.min(input.founderConcerns.length * 4, 16), 62);
}

function readinessLevel(score) {
  if (score >= 78) return "strong";
  if (score >= 62) return "credible";
  if (score >= 42) return "developing";
  return "weak";
}

function scoreFromInput(input) {
  const scores = {
    marketRisk: 36,
    executionRisk: 34,
    complianceRisk: 24,
    aiSafetyRisk: input.usesAI ? 42 : 16,
    scalabilityRisk: 34,
    monetizationRisk: 34,
  };

  const industry = input.industry.toLowerCase();
  if (industry.includes("health")) {
    scores.complianceRisk += 24;
    scores.aiSafetyRisk += input.usesAI ? 14 : 4;
    scores.executionRisk += 8;
  } else if (industry.includes("fintech")) {
    scores.complianceRisk += 22;
    scores.monetizationRisk += 8;
    scores.executionRisk += 6;
  } else if (industry.includes("legal")) {
    scores.complianceRisk += 18;
    scores.aiSafetyRisk += input.usesAI ? 12 : 2;
  } else if (industry.includes("developer")) {
    scores.marketRisk += 10;
    scores.monetizationRisk += 8;
  } else if (industry.includes("marketplace")) {
    scores.marketRisk += 18;
    scores.scalabilityRisk += 14;
    scores.monetizationRisk += 10;
  } else if (industry.includes("consumer")) {
    scores.marketRisk += 16;
    scores.scalabilityRisk += 10;
    scores.monetizationRisk += 8;
  } else if (industry.includes("cyber")) {
    scores.complianceRisk += 12;
    scores.executionRisk += 12;
  }

  const stage = input.startupStage.toLowerCase();
  if (stage.includes("idea") || stage.includes("pre-seed")) {
    scores.marketRisk += 12;
    scores.executionRisk += 10;
    scores.monetizationRisk += 10;
  } else if (stage.includes("seed")) {
    scores.marketRisk += 8;
    scores.executionRisk += 8;
    scores.scalabilityRisk += 6;
  } else if (stage.includes("series")) {
    scores.scalabilityRisk += 10;
    scores.executionRisk += 6;
  } else if (stage.includes("growth")) {
    scores.scalabilityRisk += 14;
    scores.executionRisk += 8;
    scores.complianceRisk += 6;
  }

  if (input.usesAI) scores.aiSafetyRisk += 12;
  if (input.handlesSensitiveData) {
    scores.complianceRisk += 12;
    scores.aiSafetyRisk += 10;
  }
  if (input.automatesDecisions) {
    scores.complianceRisk += 8;
    scores.aiSafetyRisk += 10;
    scores.executionRisk += 6;
  }

  input.founderConcerns.forEach((concern) => {
    if (concern === "competition" || concern === "customer acquisition") scores.marketRisk += 10;
    if (concern === "scaling" || concern === "operational costs") scores.scalabilityRisk += 10;
    if (concern === "regulations") scores.complianceRisk += 12;
    if (concern === "monetization") scores.monetizationRisk += 12;
    if (concern === "AI reliability") scores.aiSafetyRisk += 14;
  });

  if (input.uniqueAdvantage) {
    scores.marketRisk -= 4;
    scores.monetizationRisk -= 2;
  }
  if (!input.competitors) scores.confidencePenalty = 6;

  return Object.fromEntries(
    Object.entries(scores)
      .filter(([key]) => key !== "confidencePenalty")
      .map(([key, value]) => [key, Math.max(12, Math.min(92, value))])
  );
}
