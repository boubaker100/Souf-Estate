
// ============================================================
// app.js — Entry Point | Express + Clerk + Prisma
// ============================================================

import "dotenv/config";

import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";

// ── Routes ──────────────────────────────────────────────────
import postRoute from "./routes/post.route.js";
import userRoute from "./routes/user.route.js";
import webhookRoute from "./routes/webhook.route.js";
import adminRoute from "./routes/admin.route.js";
import userDashboardRoute from "./routes/userDashboard.route.js";

// ── Middleware ───────────────────────────────────────────────
import { globalLimiter } from "./middleware/rateLimiter.js";
import { trackVisitor } from "./middleware/visitor.middleware.js";

// ============================================================
// App Configuration
// ============================================================

const app = express();

app.set("trust proxy", 1);

// ============================================================
// CORS Configuration
// ============================================================

// CLIENT_URL مثال:
// http://localhost:5173,https://your-project.vercel.app

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // السماح للطلبات التي لا تحتوي على Origin
      // مثل بعض طلبات السيرفرات وأدوات الاختبار
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
    ],
  })
);

// ============================================================
// Security Headers
// ============================================================

app.use(helmet());

// ============================================================
// Response Compression
// ============================================================

app.use(compression());

// ============================================================
// Webhooks
// يجب أن يأتي raw body قبل express.json
// ============================================================

app.use(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookRoute
);

// ============================================================
// Body Parsers
// ============================================================

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ============================================================
// Clerk Middleware
// ============================================================

app.use(clerkMiddleware());

// ============================================================
// Visitor Tracking
// ============================================================

app.use(trackVisitor);

// ============================================================
// Rate Limiting
// ============================================================

app.use(globalLimiter);

// ============================================================
// Health Check
// ============================================================

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ============================================================
// API Routes
// ============================================================

app.use("/api/admin", adminRoute);

app.use("/api/dashboard", userDashboardRoute);

app.use("/api/users", userRoute);

app.use("/api/posts", postRoute);

// ============================================================
// Global Error Handler
// ============================================================

app.use((err, req, res, next) => {
  console.error("🔥 Error Log:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "حدث خطأ داخلي في السيرفر",

    stack:
      process.env.NODE_ENV === "development"
        ? err.stack
        : undefined,
  });
});

// ============================================================
// Start Server
// ============================================================

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🌐 Allowed Origins:", allowedOrigins);
});
