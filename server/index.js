import bodyParser from "body-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import generalRoutes from "./routes/generalRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import managementRoutes from "./routes/managementRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import analysisRoutes from "./routes/analysis.js";
import { env, getEnvironmentStatus } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { requestId } from "./middleware/requestId.js";

// CONFIGURATION
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(requestId);
app.use(express.json({ limit: "64kb" }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(requestLogger);
app.use(bodyParser.json({ limit: "64kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.nodeEnv !== "production" || env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS."));
  },
}));

// ROUTES
app.use("/api", analysisRoutes);
app.use("/general", generalRoutes);
app.use("/client", clientRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);

// SERVE FRONTEND (in production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
  });
}

app.use(errorHandler);

// MONGOOSE SETUP
const PORT = env.port;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
    console.log("Environment status:", getEnvironmentStatus());
  });
};

if (env.mongoUrl) {
  mongoose
    .connect(env.mongoUrl)
    .then(() => {
      console.log("MongoDB connected.");
      startServer();
    })
    .catch((error) => {
      console.error(`MongoDB connection failed: ${error.message}`);
      console.warn("Starting API without MongoDB. Dashboard data routes may fall back to demo data.");
      startServer();
    });
} else {
  console.warn("MONGO_URL is not configured. Starting API without MongoDB.");
  startServer();
}
