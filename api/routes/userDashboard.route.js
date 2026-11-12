// ============================================================
// routes/userDashboard.route.js
// ============================================================
import express from "express";
import {
  getMyPosts,
  toggleSavePost,
  getSavedPosts,
  getDashboardStats,
} from "../controllers/dashboard.controller.js";

import { requireAuth }   from "../middleware/auth.middleware.js";
import {  dashboardLimiter, strictLimiter } from "../middleware/rateLimiter.js";
import { addPost, deletePost, updateMyPost } from "../controllers/post.controller.js";

const router = express.Router();

// ── حماية عامة لكل المسارات ───────────────────────────────────
router.use(dashboardLimiter);
router.use(requireAuth);


router.post("/add",  addPost);
router.put("/:id",updateMyPost);
router.delete("/:id",deletePost);


// ── GET ───────────────────────────────────────────────────────
router.get("/stats",     getDashboardStats);
router.get("/my-posts",  getMyPosts);
router.get("/saved",     getSavedPosts);


// ── POST ──────────────────────────────────────────────────────
router.post("/saved/:postId", strictLimiter, toggleSavePost);

export default router;