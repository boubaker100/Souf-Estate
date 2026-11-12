// utils/audit.js
import prisma from "../lib/prisma.js";

export const createAuditLog = async (actorId, action, entity, entityId) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: actorId,
        action,
        entity,
        entityId: String(entityId),
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
};
