// ============================================================
// routes/commentRoutes.js
// ============================================================
import express from "express";

import { getComments, addComment, deleteComment } from "../controllers/comment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

// mergeParams: true ضروري هنا — بدونه، req.params.id (معرّف العقار) لن
// يصل لهذا الراوتر لأنه معرّف في الراوتر الأب (posts.js)
const router = express.Router({ mergeParams: true });

// عرض التعليقات: عام، لا يحتاج تسجيل دخول
router.get("/", getComments);

// إضافة تعليق أو رد: يتطلب تسجيل دخول عبر requireAuth الخاص بك
router.post("/", requireAuth, addComment);

// حذف تعليق: يتطلب تسجيل دخول (والتحقق من الملكية/الصلاحية داخل الكونترولر)
router.delete("/:commentId", requireAuth, deleteComment);

export default router;

// ============================================================
// طريقة الربط في ملف راوتر posts الرئيسي (مثلاً postRoutes.js)
// ============================================================
// import commentRoutes from "./commentRoutes.js";
//
// أضف هذا السطر بعد تعريفات الراوتر الموجودة عندك (GET /, POST /:id/view, GET /:id):
//   router.use("/:id/comments", commentRoutes);
//
// هذا يجعل المسارات النهائية (بافتراض أن هذا الراوتر مركّب على /api/posts):
//   GET    /api/posts/:id/comments
//   POST   /api/posts/:id/comments
//   DELETE /api/posts/:id/comments/:commentId