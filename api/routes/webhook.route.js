import prisma from "../lib/prisma.js";
import { clerkClient } from "@clerk/clerk-sdk-node";   // ⭐ نحتاجه لجلب بيانات المستخدم من Clerk
import express from "express";

const router = express.Router();

export const requireAuth = async (req, res, next) => {
  try {
    const { userId: clerkUserId } = req.auth();

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "غير مصرح — يجب تسجيل الدخول" });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    // ⭐ إنشاء المستخدم تلقائياً إذا لم يكن موجوداً
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: primaryEmail || "",
          username: clerkUser.username || clerkUser.firstName || `user_${Date.now()}`,
          avatar: clerkUser.profileImageUrl || "",
          role: "USER",
        },
      });
    }

    if (user.banned) {
      return res.status(403).json({ success: false, message: "حسابك محظور" });
    }

    // تحديث آخر تسجيل دخول
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(console.error);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "ممنوع — للأدمن فقط" });
  }
  next();
};

export default router;