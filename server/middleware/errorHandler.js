import AppError from "../utils/AppError.js";

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
}

export function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_ERROR";

  if (statusCode >= 500) {
    console.error(`[${code}] ${req.id || "-"} ${req.method} ${req.originalUrl}`, error);
  }

  res.status(statusCode).json({
    error: {
      code,
      message: statusCode >= 500 ? "Risk analysis service is temporarily unavailable." : error.message,
      requestId: req.id,
    },
  });
}
