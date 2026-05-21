export const ANALYSIS_STEPS = [
  {
    id: "basics",
    number: "01",
    eyebrow: "Startup Basics",
    title: "Frame the company context",
    description: "We start with the commercial shape of the business so the analysis reads like an investor memo, not a generic quiz.",
    fields: ["startupName", "industry", "startupStage", "businessModel", "targetAudience"],
  },
  {
    id: "product",
    number: "02",
    eyebrow: "Product Information",
    title: "Understand the product thesis",
    description: "Clarify the problem, product positioning, and user reality behind the company.",
    fields: ["productDescription", "problemSolved", "mainUsers"],
  },
  {
    id: "ai",
    number: "03",
    eyebrow: "AI Usage Analysis",
    title: "Map the AI risk surface",
    description: "This is the core operating risk layer. We use it to assess governance, reliability, regulatory pressure, and trust exposure.",
    fields: ["usesAI", "aiPurpose", "sensitiveData", "automatesDecisions", "industrySensitivity"],
  },
  {
    id: "concerns",
    number: "04",
    eyebrow: "Founder Concerns",
    title: "Prioritize what matters right now",
    description: "Select the pressure points keeping the team up at night so the report can personalize the risk priorities.",
    fields: ["founderConcerns"],
  },
  {
    id: "generate",
    number: "05",
    eyebrow: "Analysis Trigger",
    title: "Generate the investor-grade readout",
    description: "We’ll synthesize the business context, product signals, and AI governance profile into a premium analysis report.",
    fields: [],
  },
];

export const INDUSTRY_OPTIONS = [
  "B2B SaaS",
  "Fintech",
  "Healthcare",
  "LegalTech",
  "EdTech",
  "Developer Tools",
  "Cybersecurity",
  "Climate / Energy",
  "Marketplace",
  "Consumer",
];

export const STAGE_OPTIONS = [
  "Idea",
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B+",
  "Growth",
];

export const BUSINESS_MODEL_OPTIONS = [
  "Subscription",
  "Usage-based",
  "Marketplace take-rate",
  "Enterprise contracts",
  "Freemium to paid",
  "Services + software",
];

export const TARGET_AUDIENCE_OPTIONS = [
  "Startups / SMBs",
  "Mid-market teams",
  "Enterprise",
  "Consumers",
  "Regulated institutions",
  "Public sector / education",
];

export const INDUSTRY_SENSITIVITY_OPTIONS = [
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal" },
  { value: "education", label: "Education" },
  { value: "none", label: "None" },
];

export const FOUNDER_CONCERN_OPTIONS = [
  "competition",
  "scaling",
  "regulations",
  "monetization",
  "customer acquisition",
  "AI reliability",
  "operational costs",
];

export const LOADING_MESSAGES = [
  "Analyzing market conditions...",
  "Evaluating scalability...",
  "Comparing industry benchmarks...",
  "Assessing AI safety risks...",
  "Generating strategic recommendations...",
];

export const INITIAL_ANALYSIS_FORM = {
  startupName: "",
  industry: "",
  startupStage: "",
  businessModel: "",
  targetAudience: "",
  productDescription: "",
  problemSolved: "",
  mainUsers: "",
  competitors: "",
  uniqueAdvantage: "",
  usesAI: false,
  aiPurpose: "",
  sensitiveData: "",
  automatesDecisions: "",
  industrySensitivity: "",
  founderConcerns: [],
};
