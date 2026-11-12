import prisma from "../lib/prisma.js";
import { ENUMS, buildPostData, PostValidationError } from "../utils/postPayload.js";
import { findPostOrFail, assertOwnership } from "../utils/postHelpers.js";
import { buildPostFilter } from "../utils/buildPostFilter.js";

// ── الترتيب (مع ترتيب ثانوي ثابت بالـ id حتى لا يتكرر عقار أو يختفي بين الصفحات) ──
const SORT_MAP = {
  latest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
};

const MAP_SELECT = {
  id: true, title: true, price: true, latitude: true, longitude: true,
  phones: true, type: true, property: true, city: true, neighborhood: true,
  rooms: true, rentPeriod: true, furnished: true, images: true, createdAt: true,
  video: true, bathrooms: true, facades: true, floor: true, buildingFloors: true,
  constructionYear: true, width: true, length: true, area: true, hectares: true,
  garage: true, gas: true, waterTank: true, terrace: true, electricity: true,
  sewage: true, propertyCondition: true, constructionStatus: true,
  buildingMaterial: true, ownershipDocuments: true,
};

// سقف أمان لعدد علامات الخريطة
const MAP_LIMIT = 1000;

// pagination مدمجة هنا لتجنب مشكلة مسار الاستيراد
function buildPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

// ── قائمة المنشورات العامة ──
export const getPosts = async (req, res, next) => {
  try {
    const q = req.query;
    const filters = buildPostFilter(q);
    const orderBy = [SORT_MAP[q.sort] ?? SORT_MAP.latest, { id: "desc" }];

    // وضع الخريطة: كل النتائج المفلترة بدون pagination
    if (q.view === "map") {
      const posts = await prisma.post.findMany({
        where: { ...filters, latitude: { not: null }, longitude: { not: null } },
        select: MAP_SELECT,
        orderBy,
        take: MAP_LIMIT,
      });
      return res.status(200).json({ success: true, count: posts.length, data: posts });
    }

    // وضع القائمة: pagination
    const { page, limit, skip } = buildPagination(q);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where: filters, orderBy, skip, take: limit }),
      prisma.post.count({ where: filters }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
      pagination: {
        page, limit, total, totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── منشور واحد ──
export const getPost = async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id }, include: { user: { select: { username: true, avatar: true } } } });
    if (!post) return res.status(404).json({ success: false, message: "الإعلان غير موجود" });
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ── إضافة منشور ──
export const addPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.body.post ?? req.body;

    if (!body) return res.status(400).json({ success: false, message: "بيانات الإعلان غير موجودة" });
    if (!body.city) return res.status(400).json({ success: false, message: "المدينة إجبارية" });

    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ success: false, message: "يجب تحديد موقع العقار" });
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return res.status(400).json({ success: false, message: "إحداثيات غير صالحة" });

    let data;
    try {
      data = buildPostData(body, null);
    } catch (e) {
      if (e instanceof PostValidationError) return res.status(400).json({ success: false, message: e.message });
      throw e;
    }

    if (!data.phones || data.phones.length === 0) return res.status(400).json({ success: false, message: "رقم الهاتف إجباري" });
    if (!data.type || !ENUMS.type.includes(data.type)) return res.status(400).json({ success: false, message: "نوع الإعلان غير صالح" });
    if (!data.property || !ENUMS.property.includes(data.property)) return res.status(400).json({ success: false, message: "نوع العقار غير صالح" });

    const post = await prisma.post.create({
      data: {
        ...data,
        latitude: lat,
        longitude: lng,
        video: body.videoLink ? String(body.videoLink).trim() : null,
        user: { connect: { id: userId } },
      },
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ── تحديث منشور ──
export const updateMyPost = async (req, res, next) => {
  try {
    const post = await findPostOrFail(req.params.id);
    assertOwnership(post, req.user);

    const body = req.body.post ?? req.body;

    let data;
    try {
      data = buildPostData(body, post);
    } catch (e) {
      if (e instanceof PostValidationError) return res.status(400).json({ success: false, message: e.message });
      throw e;
    }

    const updated = await prisma.post.update({ where: { id: post.id }, data });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ── حذف منشور ──
export const deletePost = async (req, res, next) => {
  try {
    const post = await findPostOrFail(req.params.id);
    assertOwnership(post, req.user);

    await prisma.post.delete({ where: { id: post.id } });
    res.status(200).json({ success: true, message: "تم حذف الإعلان" });
  } catch (err) {
    next(err);
  }
};

// ── إضافة مشاهدة ──
export const viewPost = async (req, res, next) => {
  try {
    await prisma.postView.create({
      data: {
        postId: req.params.id,
        userId: req.user?.id || null,
        ipAddress: req.ip,
      },
    });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ── إضافة تقييم ──
export const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ success: false, message: "الإعلان غير موجود" });

    const review = await prisma.reviews.create({
      data: {
        postId: req.params.id,
        userId: req.user.id,
        rating,
        comment,
      },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};