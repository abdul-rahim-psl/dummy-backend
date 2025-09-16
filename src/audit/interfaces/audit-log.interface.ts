import { AuditAction, AuditStatus } from 'tcs-lib';
import type { AuditMetadata } from 'tcs-lib';

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  tenantId: string;
  action: AuditAction;
  entity: string;
  status: AuditStatus;
  metadata?: AuditMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogRepository {
  create(
    auditLog: Omit<AuditLog, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  findByTenant(tenantId: string): Promise<AuditLog[]>;
  findByActor(actor: string): Promise<AuditLog[]>;
}
