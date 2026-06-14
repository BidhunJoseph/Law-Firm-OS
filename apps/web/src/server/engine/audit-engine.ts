import { db } from "@/lib/db";

export type AuditLogInput = {
  userId?: string;
  entityType: string;
  entityId: string;
  actionType: "create" | "update" | "delete" | "login" | "download" | "upload" | "permission_change";
  beforeData?: any;
  afterData?: any;
  ipAddress?: string;
  userAgent?: string;
};

export async function logAuditAction(input: AuditLogInput) {
  try {
    await db.auditLog.create({
      data: {
        user_id: input.userId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        action_type: input.actionType,
        before_data: input.beforeData || null,
        after_data: input.afterData || null,
        ip_address: input.ipAddress || null,
        user_agent: input.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to write to AuditLog:", error);
    // Audit log failures should not block the main transaction, but should alert monitoring
  }
}
