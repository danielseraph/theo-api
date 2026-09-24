import prisma from '../config/database';
import logger from './logger';

interface AuditLogParams {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

export const createAuditLog = async (params: AuditLogParams): Promise<void> => {
  try {
    await prisma.auditLog.create({ 
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity || null,
        entityId: params.entityId || null,
        oldValues: params.oldValues ? (params.oldValues as any) : null,
        newValues: params.newValues ? (params.newValues as any) : null,
        ipAddress: params.ipAddress || null,
      }
    });
  } catch (error) {
    // Audit log failure is non-fatal; log and continue
    logger.error('Failed to create audit log', { error, action: params.action });
  }
};
