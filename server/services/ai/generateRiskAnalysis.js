import { env } from "../../config/env.js";
import { buildRiskAnalysisPrompt, PROMPT_VERSION } from "./prompts.js";
import { AnalysisApiResponseSchema, AnalysisRequestSchema, geminiResponseSchema } from "./schemas.js";
import { extractJsonObject, normalizeAnalysis } from "./transforms.js";
import { withRetry } from "./retry.js";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function generateRiskAnalysis(payload) {
  const startedAt = Date.now();
  const input = AnalysisRequestSchema.parse(payload);

  if (!env.geminiApiKey) {
    return buildResponse({
      analysis: normalizeAnalysis({}, input),
      provider: "local-fallback",
      startedAt,
      validationRecovered: true,
    });
  }

  let validationRecovered = false;
  const prompt = buildRiskAnalysisPrompt(input);

  let rawText;
  try {
    rawText = await withRetry(
      async () => callGemini(prompt),
      {
        retries: env.geminiMaxRetries,
        shouldRetry: (error) => error.retryable !== false,
      }
    );
  } catch (error) {
    console.error("Gemini analysis failed after retries. Returning local fallback analysis.", {
      status: error.status,
      message: error.message,
    });
    return buildResponse({
      analysis: normalizeAnalysis({}, input),
      provider: "local-fallback",
      startedAt,
      validationRecovered: true,
    });
  }

  let parsed;
  try {
    parsed = extractJsonObject(rawText);
  } catch {
    validationRecovered = true;
    parsed = {};
  }

  let analysis;
  try {
    analysis = normalizeAnalysis(parsed, input);
  } catch {
    validationRecovered = true;
    analysis = normalizeAnalysis({}, input);
  }

  return buildResponse({
    analysis,
    provider: "gemini",
    startedAt,
    validationRecovered,
  });
}

async function callGemini(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.geminiTimeoutMs);

  try {
    const response = await fetch(`${GEMINI_API_BASE}/models/${env.geminiModel}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          responseSchema: geminiResponseSchema,
        },
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error("Gemini request failed.");
      error.status = response.status;
      error.retryable = response.status === 429 || response.status >= 500;
      error.providerMessage = body?.error?.message;
      throw error;
    }

    const text = body?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      const error = new Error("Gemini returned no JSON text.");
      error.retryable = true;
      throw error;
    }

    return text;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Gemini request timed out.");
      timeoutError.retryable = true;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function buildResponse({ analysis, provider, startedAt, validationRecovered }) {
  const response = {
    analysis,
    metadata: {
      provider,
      model: provider === "gemini" ? env.geminiModel : "risklens-local-v1",
      promptVersion: PROMPT_VERSION,
      durationMs: Date.now() - startedAt,
      generatedAt: new Date().toISOString(),
      validationRecovered,
    },
  };

  return AnalysisApiResponseSchema.parse(response);
}
