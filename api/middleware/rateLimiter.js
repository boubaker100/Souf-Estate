import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const userOrIpKey = (req) => req.auth()?.userId || ipKeyGenerator(req);

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests..." },
});

export const dashboardLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { success: false, message: "Too many dashboard requests..." },
});

export const strictLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { success: false, message: "Too many modification requests..." },
});