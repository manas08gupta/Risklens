import dotenv from "dotenv";

dotenv.config();

const parseIntEnv = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5001,
  mongoUrl: process.env.MONGO_URL || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  geminiTimeoutMs: parseIntEnv(process.env.GEMINI_TIMEOUT_MS, 30000),
  geminiMaxRetries: parseIntEnv(process.env.GEMINI_MAX_RETRIES, 2),
  allowedOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export function getEnvironmentStatus() {
  return {
    hasMongoUrl: Boolean(env.mongoUrl),
    hasGeminiApiKey: Boolean(env.geminiApiKey),
    geminiModel: env.geminiModel,
  };
}
