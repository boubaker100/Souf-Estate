// ============================================================
// app.js — Entry Point | Express + Clerk + Prisma
// ============================================================

import "dotenv/config"; // ✅ مرة واحدة فقط
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";

// ── Routes ──────────────────────────────────────────────────
import postRoute         from "./routes/post.route.js";
import userRoute         from "./routes/user.route.js";
import webhookRoute      from "./routes/webhook.route.js";
import adminRoute        from "./routes/admin.route.js";
import userDashboardRoute from "./routes/userDashboard.route.js";

// ── Middleware ───────────────────────────────────────────────
import { globalLimiter }  from "./middleware/rateLimiter.js";
import { trackVisitor }   from "./middleware/visitor.middleware.js";

// ============================================================
const app = express();
app.set("trust proxy", 1);
// CORS origins: allow all if not configured (deployment convenience)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["*"];

// If wildcard is used, disable credentials (browser restriction)
const allowCredentials = allowedOrigins[0] !== "*";


// ── CORS ─────────────────────────────────────────────────────

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins[0] === "*" || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: allowCredentials,
  }),
);

// ── Security headers (helmet) ─────────────────────────────────
app.use(helmet());

// ── Response compression ──────────────────────────────────────
app.use(compression());

// ── Webhooks (raw body يجب أن يأتي قبل express.json) ─────────
app.use(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookRoute
);
app.options("*", cors()); // يستجيب لجميع طلبات OPTIONS
// ── Body Parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Clerk (يضيف req.auth لكل الطلبات) ────────────────────────
app.use(clerkMiddleware());

// ── Visitor Tracking ──────────────────────────────────────────
app.use(trackVisitor);

// ── Rate Limiting (عام) ───────────────────────────────────────
app.use(globalLimiter);

// ── Health Check ──────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/admin",     adminRoute);
app.use("/api/dashboard", userDashboardRoute);
app.use("/api/users",     userRoute);
app.use("/api/posts",     postRoute);

// ── Global Error Handler ──────────────────────────────────────
// ── ميدلوير معالجة الأخطاء العام (يمنع إرسال HTML نهائياً) ──
app.use((err, req, res, next) => {
  console.error("🔥 Error Log:", err.message);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "حدث خطأ داخلي في السيرفر",
    // اختياري: إظهار تفاصيل الخطأ فقط في بيئة التطوير
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});