// ============================================================
// utils/postHelpers.js — منطق مشترك بين controllers
// ============================================================
import prisma from "../lib/prisma.js";

/**
تبحث عن المنشور في قاعدة البيانات بواسطة id. إذا لم يُوجد ترمي خطأ بحالة 404 مباشرةً، بدل تكرار نفس التحقق في كل controller.
 */
export const findPostOrFail = async (id) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    const err = new Error("الإعلان غير موجود");
    err.status = 404;
    throw err;
  }
  return post;
};

/**
 * يتحقق أن المستخدم هو المالك — أو أدمن اختياريًا
 * @param {object} post        — كائن المنشور من Prisma
 * @param {object} user        — req.user
 * @param {boolean} allowAdmin — هل يُسمح للأدمن بالتجاوز؟
 */
export const assertOwnership = (post, user, allowAdmin = false) => {
  const isOwner = post.userId === user.id;
  const isAdmin = allowAdmin && user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    const err = new Error("غير مصرح");
    err.status = 403;
    throw err;
  }
};