import express from "express";
import cors from "cors";
import "dotenv/config";

import profileRoutes from "./routes/profile.routes";
import billsRoutes from "./routes/bills.routes";
import forecastRoutes from "./routes/forecast.routes";
import aiRoutes from "./routes/ai.routes";
import challengeRoutes from "./routes/challenge.routes";
import sideHustlesRoutes from "./routes/sideHustles.routes";
import savingsRoutes from "./routes/savings.routes";
import educationRoutes from "./routes/education.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() }, error: null });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/profile", profileRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/challenge", challengeRoutes);
app.use("/api/side-hustles", sideHustlesRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { message: "Route not found" },
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[UNHANDLED ERROR]", err);
  res.status(500).json({
    success: false,
    data: null,
    error: { message: err.message ?? "Internal server error" },
  });
});

export default app;
