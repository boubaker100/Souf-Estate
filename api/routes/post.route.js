import express from "express";
import {
  getPosts,
  getPost,
  createReview,
  viewPost
} from "../controllers/post.controller.js";

import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.middleware.js";

import commentRoutes from "./comment.route.js";

const router = express.Router();

// Public

router.get("/",getPosts);
router.post("/:id/view", viewPost)
router.get("/:id", getPost);

router.use("/:id/comments", commentRoutes);



router.post("/:id/reviews", requireAuth,createReview);
router.post("/:id/reviews", createReview);



export default router;
