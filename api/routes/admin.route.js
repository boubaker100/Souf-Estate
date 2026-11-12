import express from "express";
import {
  deletePostAdmin,
  getAdminPosts,
  togglePostStatus,
  bulkDeletePosts,
  getAdminUsers,
  getAdminDashboardData
} from "../controllers/admin.controller.js";

import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(requireAuth, requireAdmin);



router.get("/dashboard",getAdminDashboardData)
router.get("/posts", getAdminPosts);
router.delete("/posts/:id", deletePostAdmin);
router.patch("/posts/:id/toggle", togglePostStatus);

// new endpoints
router.post("/posts/bulk-delete", bulkDeletePosts);

router.get("/users",getAdminUsers);




export default router;
