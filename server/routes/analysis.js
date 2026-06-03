import express from "express";
import { ZodError } from "zod";
import { generateRiskAnalysis } from "../services/ai/generateRiskAnalysis.js";
import { AnalysisRequestSchema } from "../services/ai/schemas.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/analyze", rateLimit({ windowMs: 60_000, max: 10 }), asyncHandler(async (req, res, next) => {
  try {
    const payload = AnalysisRequestSchema.parse(req.body);
    const result = await generateRiskAnalysis(payload);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return next(new AppError("Submitted startup analysis data is incomplete or invalid.", 400, "INVALID_ANALYSIS_INPUT", error.flatten()));
    }
    return next(error);
  }
}));

export default router;
