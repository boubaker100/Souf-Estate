// ============================================================
// controllers/commentController.js
// ============================================================
import prisma from "../lib/prisma.js"; // عدّل المسار حسب مكان إعداد Prisma Client عندك

// جلب كل تعليقات عقار معيّن، منظّمة كشجرة (تعليقات رئيسية + ردودها متداخلة)
export const getComments = async (req, res, next) => {
  try {
    const { id: postId } = req.params; // بما أن الراوتر مركّب تحت /:id/comments في posts

    const allComments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    // ملاحظة: هذا الراوت (GET) عام وغير محمي بـ requireAuth، لذا لا نضمن
    // وجود req.user هنا إلا إذا كان عندك middleware اختياري (optional auth)
    // مطبّق على هذا المسار تحديداً. إذا لم يكن موجوداً، isOwn ستبقى false
    // دائماً من هذا المسار، وهذا لا يشكل ثغرة أمنية: الحذف الفعلي محمي
    // ومتحقَّق منه بشكل صحيح داخل deleteComment بغض النظر عما تعرضه الواجهة.
    // إذا أردت إظهار زر الحذف بدقة فوراً دون محاولة، أضف middleware اختياري
    // يملأ req.user إن وُجدت جلسة صالحة دون رفض الطلب إن لم توجد.
    const viewerId = req.user?.id || null;

    const byId = {};
    allComments.forEach((c) => {
      byId[c.id] = { ...c, isOwn: viewerId ? c.userId === viewerId : false, replies: [] };
    });

    const topLevel = [];
    allComments.forEach((c) => {
      if (c.parentId && byId[c.parentId]) {
        byId[c.parentId].replies.push(byId[c.id]);
      } else {
        topLevel.push(byId[c.id]);
      }
    });

    res.status(200).json({ success: true, data: topLevel });
  } catch (err) {
    next(err);
  }
};

// إضافة تعليق جديد (رئيسي أو رد على تعليق آخر)
// يفترض هذا الكونترولر أن الراوت محمي بـ requireAuth.js الموجود عندك،
// والذي يضع المستخدم الكامل (من قاعدة البيانات) في req.user
export const addComment = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { content, parentId } = req.body;

    // req.user يأتي من requireAuth.js الخاص بك (وليس من Clerk مباشرة) —
    // req.user.id هو معرّف المستخدم الداخلي في Prisma/MongoDB
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "يجب تسجيل الدخول لإضافة تعليق" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "لا يمكن إرسال تعليق فارغ" });
    }

    // التحقق من أن التعليق الأب (في حالة الرد) موجود فعلاً ويخص نفس العقار
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parentComment || parentComment.postId !== postId) {
        return res.status(400).json({ success: false, message: "التعليق الأصلي غير موجود" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        parentId: parentId || null,
        userId: currentUser.id,
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    res.status(201).json({ success: true, data: { ...comment, replies: [] } });
  } catch (err) {
    next(err);
  }
};

// حذف تعليق — يُسمح فقط لصاحب التعليق (يمكن توسيعها لاحقاً للسماح
// لصاحب العقار أو الأدمن أيضاً بحذف تعليقات غير لائقة)
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "غير مصرح" });
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ success: false, message: "التعليق غير موجود" });
    }

    const isOwner = comment.userId === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN"; // متاح لأنك أصلاً عندك requireAdmin مبني على req.user.role
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "لا يمكنك حذف تعليق ليس ملكك" });
    }

    // حذف التعليق وكل ردوده المتداخلة بالتكرار (لأن العلاقة الذاتية في
    // Prisma لا تدعم onDelete: Cascade مباشرة على نفس الموديل بسهولة)
    const deleteWithReplies = async (id) => {
      const replies = await prisma.comment.findMany({ where: { parentId: id } });
      for (const reply of replies) {
        await deleteWithReplies(reply.id);
      }
      await prisma.comment.delete({ where: { id } });
    };

    await deleteWithReplies(commentId);

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};