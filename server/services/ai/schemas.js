import { z } from "zod";

const trimmedString = (min = 1, max = 4000) => z.string().trim().min(min).max(max);
const optionalTrimmedString = (max = 4000) => z.string().trim().max(max).optional().default("");
const scoreSchema = z.coerce.number().int().min(0).max(100);

export const AnalysisRequestSchema = z.object({
  startupName: trimmedString(1, 120),
  industry: trimmedString(1, 120),
  startupStage: trimmedString(1, 80),
  businessModel: trimmedString(1, 120),
  targetAudience: trimmedString(1, 160),
  description: trimmedString(20, 4000),
  problemSolved: trimmedString(20, 4000),
  mainUsers: optionalTrimmedString(2000),
  competitors: optionalTrimmedString(2000),
  uniqueAdvantage: optionalTrimmedString(2000),
  usesAI: z.coerce.boolean().default(false),
  aiPurpose: optionalTrimmedString(2000),
  handlesSensitiveData: z.coerce.boolean().default(false),
  automatesDecisions: z.coerce.boolean().default(false),
  founderConcerns: z.array(trimmedString(1, 80)).min(1).max(8),
});

export const SeveritySchema = z.enum(["low", "medium", "high"]);
export const RiskCategorySchema = z.enum([
  "market",
  "execution",
  "compliance",
  "ai_safety",
  "scalability",
  "monetization",
]);

export const RiskFindingSchema = z.object({
  severity: SeveritySchema,
  category: RiskCategorySchema,
  title: trimmedString(4, 120),
  description: trimmedString(20, 600),
  recommendation: trimmedString(20, 600),
});

export const RiskScoresSchema = z.object({
  marketRisk: scoreSchema,
  executionRisk: scoreSchema,
  complianceRisk: scoreSchema,
  aiSafetyRisk: scoreSchema,
  scalabilityRisk: scoreSchema,
  monetizationRisk: scoreSchema,
});

export const RecommendationSchema = z.object({
  priority: z.enum(["P1", "P2", "P3", "P4"]),
  title: trimmedString(4, 120),
  rationale: trimmedString(20, 600),
  action: trimmedString(20, 600),
});

export const BenchmarkInsightsSchema = z.object({
  peerComparison: trimmedString(20, 500),
  categoryPressure: trimmedString(20, 500),
  defensibilitySignal: trimmedString(20, 500),
  uncertainty: trimmedString(20, 500),
});

export const InvestorReadinessSchema = z.object({
  score: scoreSchema,
  level: z.enum(["weak", "developing", "credible", "strong"]),
  summary: trimmedString(20, 600),
});

export const FullAnalysisResponseSchema = z.object({
  overallRiskScore: scoreSchema,
  confidenceScore: scoreSchema,
  marketRisk: scoreSchema,
  executionRisk: scoreSchema,
  complianceRisk: scoreSchema,
  aiSafetyRisk: scoreSchema,
  scalabilityRisk: scoreSchema,
  monetizationRisk: scoreSchema,
  findings: z.array(RiskFindingSchema).min(3).max(8),
  strengths: z.array(trimmedString(10, 400)).min(2).max(6),
  recommendations: z.array(RecommendationSchema).min(3).max(6),
  benchmarkComparison: BenchmarkInsightsSchema,
  investorReadiness: InvestorReadinessSchema,
  confidenceExplanation: trimmedString(30, 700),
  assumptions: z.array(trimmedString(10, 300)).min(2).max(6),
  missingInformation: z.array(trimmedString(10, 240)).min(2).max(6),
  riskSummary: trimmedString(80, 1200),
});

export const AnalysisApiResponseSchema = z.object({
  analysis: FullAnalysisResponseSchema,
  metadata: z.object({
    provider: z.enum(["gemini", "local-fallback"]),
    model: z.string(),
    promptVersion: z.string(),
    durationMs: z.number().int().nonnegative(),
    generatedAt: z.string(),
    validationRecovered: z.boolean(),
  }),
});

export const geminiResponseSchema = {
  type: "object",
  required: [
    "overallRiskScore",
    "confidenceScore",
    "marketRisk",
    "executionRisk",
    "complianceRisk",
    "aiSafetyRisk",
    "scalabilityRisk",
    "monetizationRisk",
    "findings",
    "strengths",
    "recommendations",
    "benchmarkComparison",
    "investorReadiness",
    "confidenceExplanation",
    "assumptions",
    "missingInformation",
    "riskSummary",
  ],
  properties: {
    overallRiskScore: { type: "integer", minimum: 0, maximum: 100 },
    confidenceScore: { type: "integer", minimum: 0, maximum: 100 },
    marketRisk: { type: "integer", minimum: 0, maximum: 100 },
    executionRisk: { type: "integer", minimum: 0, maximum: 100 },
    complianceRisk: { type: "integer", minimum: 0, maximum: 100 },
    aiSafetyRisk: { type: "integer", minimum: 0, maximum: 100 },
    scalabilityRisk: { type: "integer", minimum: 0, maximum: 100 },
    monetizationRisk: { type: "integer", minimum: 0, maximum: 100 },
    findings: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        required: ["severity", "category", "title", "description", "recommendation"],
        properties: {
          severity: { type: "string", enum: ["low", "medium", "high"] },
          category: { type: "string", enum: ["market", "execution", "compliance", "ai_safety", "scalability", "monetization"] },
          title: { type: "string" },
          description: { type: "string" },
          recommendation: { type: "string" },
        },
      },
    },
    strengths: { type: "array", minItems: 2, maxItems: 6, items: { type: "string" } },
    recommendations: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        required: ["priority", "title", "rationale", "action"],
        properties: {
          priority: { type: "string", enum: ["P1", "P2", "P3", "P4"] },
          title: { type: "string" },
          rationale: { type: "string" },
          action: { type: "string" },
        },
      },
    },
    benchmarkComparison: {
      type: "object",
      required: ["peerComparison", "categoryPressure", "defensibilitySignal", "uncertainty"],
      properties: {
        peerComparison: { type: "string" },
        categoryPressure: { type: "string" },
        defensibilitySignal: { type: "string" },
        uncertainty: { type: "string" },
      },
    },
    investorReadiness: {
      type: "object",
      required: ["score", "level", "summary"],
      properties: {
        score: { type: "integer", minimum: 0, maximum: 100 },
        level: { type: "string", enum: ["weak", "developing", "credible", "strong"] },
        summary: { type: "string" },
      },
    },
    confidenceExplanation: { type: "string" },
    assumptions: { type: "array", minItems: 2, maxItems: 6, items: { type: "string" } },
    missingInformation: { type: "array", minItems: 2, maxItems: 6, items: { type: "string" } },
    riskSummary: { type: "string" },
  },
};
