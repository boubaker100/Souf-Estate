import express from "express";
import {getUsers,getUser,updateUser,deleteUser,savePost,profilePosts,} from "../controllers/user.controller.js";

import {requireAuth,requireAdmin} from "../middleware/auth.middleware.js";

const router = express.Router();

/* ==================== ADMIN ROUTES ==================== */
router.get("/me",requireAuth,(req, res) => {res.json(req.user);});

// عرض كل المستخدمين (Admin فقط)
router.get("/",requireAuth,requireAdmin,getUsers);

// عرض مستخدم واحد (Admin فقط)
router.get("/:id",requireAuth,requireAdmin,getUser);


/* ==================== USER ROUTES ==================== */

// تحديث الحساب
router.put("/me/update",requireAuth,updateUser);

// حذف الحساب
router.delete("/me/delete",requireAuth,deleteUser);

// حفظ / إزالة منشور
router.post("/save",requireAuth,savePost);

// منشورات البروفايل
router.get("/profilePosts",requireAuth,profilePosts);

export default router;
