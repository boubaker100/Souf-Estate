import prisma from "../lib/prisma.js";

// دالة مساعدة لجلب بيانات المستخدم من Clerk API
async function fetchClerkUser(userId) {
  const clerkApiUrl = `https://api.clerk.com/v1/users/${userId}`;
  const response = await fetch(clerkApiUrl, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error(`فشل جلب بيانات المستخدم من Clerk: ${response.status}`);
  }
  return response.json();
}

// ── requireAuth ─────────────────────────────────────────────
export const requireAuth = async (req, res, next) => {
  try {
    // استخراج userId من req.auth() (Clerk middleware)
    const { userId: clerkUserId } = req.auth();

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "غير مصرح — يجب تسجيل الدخول" });
    }

    // البحث عن المستخدم في قاعدة البيانات
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    // إذا لم يكن موجوداً، قم بإنشائه تلقائياً باستخدام بيانات Clerk
    if (!user) {
      console.log(`🆕 إنشاء مستخدم جديد تلقائياً: clerkId = ${clerkUserId}`);
      
      // جلب بيانات المستخدم من Clerk
      const clerkUser = await fetchClerkUser(clerkUserId);
      
      // استخراج البريد الإلكتروني الأساسي
      const primaryEmail = clerkUser.email_addresses.find(
        (e) => e.id === clerkUser.primary_email_address_id
      )?.email_address || "";

      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: primaryEmail,
          username: clerkUser.username || clerkUser.first_name || `user_${Date.now()}`,
          avatar: clerkUser.profile_image_url || "",
          role: "USER",
        },
      });
    }

    // التحقق من الحظر
    if (user.banned) {
      return res.status(403).json({ success: false, message: "حسابك محظور" });
    }

    // تحديث آخر تسجيل دخول (في الخلفية)
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(console.error);

    req.user = user; // الآن req.user.id يحمل MongoDB id
    next();
  } catch (error) {
    console.error("❌ خطأ في requireAuth:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ── requireAdmin ─────────────────────────────────────────────
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "ممنوع — للأدمن فقط" });
  }
  next();
};
