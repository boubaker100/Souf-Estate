// ============================================================
// controllers/dashboard.controller.js — لوحة تحكم المستخدم
// ============================================================
import prisma from "../lib/prisma.js";
import { buildPostFilter } from "../utils/buildPostFilter.js";
import { buildPagination }  from "../utils/buildPagination.js";
import { findPostOrFail, assertOwnership } from "../utils/postHelpers.js";
import { buildPostData, PostValidationError } from "../utils/postPayload.js";

const SORT_MAP = {
  latest:     { createdAt: "desc" },
  oldest:     { createdAt: "asc" },
  price_asc:  { price: "asc" },
  price_desc: { price: "desc" },
};

// ─────────────────────────────────────────────────────────────
// تجلب إعلانات المستخدم الحالي فقط مع دعم الفلترة والترتيب والـ pagination.
// ─────────────────────────────────────────────────────────────
export const getMyPosts = async (req, res, next) => {
  try {
    const filter               = buildPostFilter(req.query, req.user.id);
    const { page, limit, skip } = buildPagination(req.query);
    const orderBy              = SORT_MAP[req.query.sort] ?? SORT_MAP.latest;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where: filter, orderBy, skip, take: limit }),
      prisma.post.count({ where: filter }),
    ]);

    res.status(200).json({
      success: true,
      data: posts,
      meta: { total, page, totalPages: Math.ceil(total / limit), limit },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// تعدّل إعلان المستخدم. المالك فقط بدون استثناء للأدمن — لأن الداشبورد شخصي.
// ─────────────────────────────────────────────────────────────
export const updateMyPost = async (req, res, next) => {
  try {
    // 1. البحث عن الإعلان أو إرجاع خطأ 404
    const post = await findPostOrFail(req.params.id);

    // 2. التحقق من الملكية (المالك فقط)
    assertOwnership(post, req.user);

    const body = req.body.post ?? req.body;
    if (!body) {
      return res.status(400).json({ success: false, message: "بيانات التعديل مفقودة" });
    }

    // 3. بناء بيانات التحديث
    let updateData;
    try {
      updateData = buildPostData(body, post);
    } catch (error) {
      if (error instanceof PostValidationError)
        return res.status(400).json({ success: false, message: error.message });
      throw error;
    }


    // 4. تحديث الإعلان باستخدام بريزما
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: updateData,
    });

    // 5. إرجاع الاستجابة بنفس التنسيق المعتمد في مشروعك
    res.status(200).json({
      success: true,
      message: "تم تحديث الإعلان بنجاح",
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// تحذف إعلان المستخدم. المالك فقط بدون استثناء للأدمن.
// ─────────────────────────────────────────────────────────────
export const deleteMyPost = async (req, res, next) => {
  try {
    const post = await findPostOrFail(req.params.id);
    assertOwnership(post, req.user); // المالك فقط

    await prisma.post.delete({ where: { id: post.id } });

    res.status(200).json({ success: true, message: "تم حذف الإعلان" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// تحفظ إعلاناً أو تلغي حفظه. إذا كان محفوظاً مسبقاً تحذفه، وإذا لم يكن تضيفه.
// ─────────────────────────────────────────────────────────────
export const toggleSavePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const existing = await prisma.savedPost.findFirst({
      where: { userId: req.user.id, postId },
    });

    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      return res.status(200).json({ success: true, saved: false, message: "تم إلغاء الحفظ" });
    }

    await prisma.savedPost.create({ data: { userId: req.user.id, postId } });
    res.status(201).json({ success: true, saved: true, message: "تم حفظ الإعلان" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// تجلب قائمة الإعلانات التي حفظها المستخدم مرتبةً من الأحدث للأقدم.
// ─────────────────────────────────────────────────────────────
export const getSavedPosts = async (req, res, next) => {
  try {
    const savedPosts = await prisma.savedPost.findMany({
      where:   { userId: req.user.id },
      include: { post: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: savedPosts.length,
      data:  savedPosts.map((item) => item.post),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// ترجع إجمالي إعلانات المستخدم وعدد الإعلانات المحفوظة لديه.
// ─────────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const [postsCount, savedCount] = await Promise.all([
      prisma.post.count({ where: { userId: req.user.id } }),
      prisma.savedPost.count({ where: { userId: req.user.id } }),
    ]);

    res.status(200).json({
      success: true,
      data: { postsCount, savedCount },
    });
  } catch (error) {
    next(error);
  }
};