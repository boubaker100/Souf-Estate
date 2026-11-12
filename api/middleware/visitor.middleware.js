import prisma from "../lib/prisma.js";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";

export const trackVisitor = async (req, res, next) => {
  try {
    let visitorId = req.cookies.visitorId;

    if (!visitorId) {
      visitorId = uuidv4();
      res.cookie("visitorId", visitorId, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
    }

    const parser = new UAParser(req.headers["user-agent"]);
    const deviceType = parser.getDevice().type || "desktop";
    const browser = parser.getBrowser().name;
    const os = parser.getOS().name;

    await prisma.siteVisit.create({
      data: {
        visitorId,
        userId: req.user?.id || null,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        deviceType,
        browser,
        os,
      },
    });
  } catch (err) {
    // فقط سجل الخطأ ولا ترسل استجابة هنا، ولا تستدعِ next(err) إذا كنت تريد متابعة العمل
    console.warn("⚠️ تحذير: فشل تسجيل الزيارة، الموقع مستمر في العمل:", err.message);
  }

  // استدعاء واحد فقط لـ next هنا في نهاية الدالة
  next();
};