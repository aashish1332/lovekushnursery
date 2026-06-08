import prisma from './prisma'

export async function logAudit(params: {
  action: string
  entity: string
  entityId?: string
  details?: Record<string, any>
  performedBy: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details ? JSON.stringify(params.details) : null,
        performedBy: params.performedBy,
      },
    })
  } catch (err) {
    console.error('[Audit Log Error]', err)
  }
}
