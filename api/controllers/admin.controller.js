// ============================================================
// controllers/admin.controller.js
// ============================================================
import prisma from "../lib/prisma.js";
import { createAuditLog } from "../utils/audit.js";
import { findPostOrFail } from "../utils/postHelpers.js";
import { ENUMS } from "../utils/postPayload.js";

// ─── Helpers محلية (خاصة بالأدمن) ───────────────────────────

function buildPostsWhere({ type, status, search, city }) {
  const where = {};
  if (type)   where.type   = type;
  if (status) where.status = status;
  if (city)   where.city   = city;
  if (search) {
    where.OR = [
      { title:       { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city:        { contains: search, mode: "insensitive" } },
    ];
  }
  return where;
}

function buildPostsOrderBy(sort) {
  const map = {
    price_asc:    { price: "asc" },
    price_desc:   { price: "desc" },
    created_asc:  { createdAt: "asc" },
    created_desc: { createdAt: "desc" },
  };
  return map[sort] ?? map.created_desc;
}

function parsePostsQuery(query) {
  return {
    page:   Math.max(1, parseInt(query.page) || 1),
    take:   Math.min(100, Math.max(1, parseInt(query.take) || 10)),
    search: query.search?.trim() || "",
    // ✅ نستعمل ENUMS.type (مبنية من enum PostType في السكيما، عبر utils/postPayload.js)
    //    بدل قائمة ثابتة مكتوبة يدوياً، حتى تبقى متزامنة أوتوماتيكياً مع أي تعديل مستقبلي
    type:   ENUMS.type.includes(query.type)                   ? query.type   : null,
    status: ["ACTIVE", "INACTIVE"].includes(query.status)     ? query.status : null,
    city:   query.city?.trim() || "",
    sort:   query.sort || "created_desc",
  };
}

// ─────────────────────────────────────────────────────────────
// تجلب إحصائيات شاملة للفترة المحددة: المستخدمين، المنشورات، الزوار، نسب النمو، وأكثر الإعلانات مشاهدةً.
// ─────────────────────────────────────────────────────────────
export const getAdminDashboardData = async (req, res, next) => {
  try {
    const range = req.query.range || "30d";
    const value = parseInt(range.slice(0, -1));
    const unit  = range.slice(-1).toLowerCase();
    const days  = ({ d: 1, m: 30, y: 365 }[unit] ?? 1) * value || 30;

    const endDate   = new Date(); endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(); startDate.setDate(endDate.getDate() - (days - 1)); startDate.setHours(0, 0, 0, 0);

    const prevEndDate   = new Date(startDate); prevEndDate.setDate(prevEndDate.getDate() - 1); prevEndDate.setHours(23, 59, 59, 999);
    const prevStartDate = new Date(prevEndDate); prevStartDate.setDate(prevEndDate.getDate() - (days - 1)); prevStartDate.setHours(0, 0, 0, 0);

    const currentRange = { gte: startDate, lte: endDate };
    const prevRange    = { gte: prevStartDate, lte: prevEndDate };

    const [
      totalUsers, totalPosts, rentPosts, buyPosts, bannedUsers, inactivePosts,
      previousUsers, previousPosts, previousRentPosts, previousBuyPosts,
      topViewed, postsAgg, usersAgg, visitorsAgg, visitorsPerDayAgg, returningVisitorsAgg,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: currentRange } }),
      prisma.post.count({ where: { createdAt: currentRange } }),
      prisma.post.count({ where: { type: "rent", createdAt: currentRange } }),
      prisma.post.count({ where: { type: "buy",  createdAt: currentRange } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.post.count({ where: { status: "INACTIVE" } }),
      prisma.user.count({ where: { createdAt: prevRange } }),
      prisma.post.count({ where: { createdAt: prevRange } }),
      prisma.post.count({ where: { type: "rent", createdAt: prevRange } }),
      prisma.post.count({ where: { type: "buy",  createdAt: prevRange } }),
      prisma.post.findMany({
        orderBy: { views: { _count: "desc" } },
        take: 5,
        select: { id: true, title: true, city: true, price: true, _count: { select: { views: true } } },
      }),
      prisma.$runCommandRaw({ aggregate: "Post", pipeline: [
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ], cursor: {} }),
      prisma.$runCommandRaw({ aggregate: "User", pipeline: [
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ], cursor: {} }),
      prisma.$runCommandRaw({ aggregate: "SiteVisit", pipeline: [
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: "$visitorId" } },
        { $count: "count" },
      ], cursor: {} }),
      prisma.$runCommandRaw({ aggregate: "SiteVisit", pipeline: [
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, device: "$deviceType" }, count: { $sum: 1 } } },
        { $sort: { "_id.date": 1 } },
      ], cursor: {} }),
      prisma.$runCommandRaw({ aggregate: "SiteVisit", pipeline: [
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: "$visitorId", visits: { $sum: 1 } } },
        { $match: { visits: { $gt: 1 } } },
        { $count: "count" },
      ], cursor: {} }),
    ]);

    const calcGrowth = (cur, prev) =>
      prev === 0 ? (cur > 0 ? 100 : 0) : Number((((cur - prev) / prev) * 100).toFixed(1));

    res.json({
      overview: {
        totalUsers,   usersGrowth:  calcGrowth(totalUsers, previousUsers),
        totalPosts,   postsGrowth:  calcGrowth(totalPosts, previousPosts),
        rentPosts,    rentGrowth:   calcGrowth(rentPosts, previousRentPosts),
        buyPosts,     buyGrowth:    calcGrowth(buyPosts, previousBuyPosts),
        bannedUsers,  inactivePosts,
        totalVisitors: visitorsAgg.cursor.firstBatch?.[0]?.count || 0,
        returning:     returningVisitorsAgg.cursor.firstBatch?.[0]?.count || 0,
      },
      charts: {
        postsPerDay:    postsAgg.cursor.firstBatch,
        usersPerDay:    usersAgg.cursor.firstBatch,
        visitorsPerDay: visitorsPerDayAgg.cursor.firstBatch,
      },
      topViewed,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// تجلب قائمة كل المستخدمين مع عدد منشوراتهم، مع دعم الفلترة بحد أدنى للمنشورات والترتيب
// ─────────────────────────────────────────────────────────────
export const getAdminUsers = async (req, res, next) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page) || 1);
    const take      = Math.min(100, parseInt(req.query.take) || 10);
    const minPosts  = parseInt(req.query.minPosts) || 0;
    const skip      = (page - 1) * take;

    const orderByMap = {
      created_desc:   { createdAt: "desc" },
      created_asc:    { createdAt: "asc" },
      lastLogin_desc: { lastLoginAt: "desc" },
      lastLogin_asc:  { lastLoginAt: "asc" },
    };
    const orderBy = orderByMap[req.query.sort] ?? orderByMap.created_desc;

    const [users, total] = await Promise.all([
      prisma.user.findMany({ skip, take, orderBy, include: { _count: { select: { posts: true } } } }),
      prisma.user.count(),
    ]);

    const filtered = minPosts > 0 ? users.filter((u) => u._count.posts >= minPosts) : users;

    res.json({ users: filtered, total, totalPages: Math.ceil(total / take), page, take });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// تجلب كل المنشورات مع فلاتر البحث النصي والمدينة والنوع والحالة، بصلاحية كاملة بدون تقييد بالمالك.
// ─────────────────────────────────────────────────────────────
export const getAdminPosts = async (req, res, next) => {
  try {
    const { page, take, search, type, status, city, sort } = parsePostsQuery(req.query);
    const skip    = (page - 1) * take;
    const where   = buildPostsWhere({ type, status, search, city });
    const orderBy = buildPostsOrderBy(sort);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where, skip, take, orderBy, include: { _count: { select: { views: true } } } }),
      prisma.post.count({ where }),
    ]);

    res.json({ posts, total, totalPages: Math.ceil(total / take), page, take });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/posts/:id — أدمن يحذف أي منشور + audit log
// ─────────────────────────────────────────────────────────────
export const deletePostAdmin = async (req, res, next) => {
  try {
    const post = await findPostOrFail(req.params.id); // ✅ من utils مشتركة

    await prisma.post.delete({ where: { id: post.id } });
    await createAuditLog(req.user.id, "DELETE_POST", "POST", post.id);

    res.json({ success: true, message: "تم حذف الإعلان", deletedId: post.id });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// تبدّل حالة المنشور بين ACTIVE و INACTIVE 
// ─────────────────────────────────────────────────────────────
export const togglePostStatus = async (req, res, next) => {
  try {
    const post = await findPostOrFail(req.params.id); // ✅ من utils مشتركة

    const updated = await prisma.post.update({
      where: { id: post.id },
      data:  { status: post.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
    });

    await createAuditLog(req.user.id, "TOGGLE_POST_STATUS", "POST", post.id);

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// تحذف مجموعة منشورات دفعةً واحدة بحد أقصى 100 منشور. تستخدم 
// deleteMany لأنه أسرع من transactions فردية.
// ─────────────────────────────────────────────────────────────
export const bulkDeletePosts = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ success: false, message: "لم يتم توفير معرّفات" });
    if (ids.length > 100)
      return res.status(400).json({ success: false, message: "الحد الأقصى 100 منشور" });

    const result = await prisma.post.deleteMany({ where: { id: { in: ids } } });
    await createAuditLog(req.user.id, "BULK_DELETE_POSTS", "POST", ids.join(","));

    res.json({ success: true, message: `تم حذف ${result.count} منشور` });
  } catch (err) {
    next(err);
  }
};