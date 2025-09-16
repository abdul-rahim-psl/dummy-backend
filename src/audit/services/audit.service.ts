import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLog } from '../interfaces/audit-log.interface';
import { AuditLogResponse } from '../interfaces/audit-response.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly auditLogs: Map<string, AuditLog> = new Map();

  async createAuditLog(
    createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLogResponse> {
    try {
      const auditLog = await this.buildAuditLog(createAuditLogDto);
      const savedLog = await this.persistAuditLog(auditLog);

      this.logger.log(
        `Audit log created successfully for actor: ${createAuditLogDto.actor}, action: ${createAuditLogDto.action}`,
      );

      return this.mapToResponse(savedLog);
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAuditLogById(id: string): Promise<AuditLogResponse | null> {
    try {
      const auditLog = this.auditLogs.get(id);
      if (!auditLog) {
        this.logger.warn(`Audit log not found for id: ${id}`);
        return null;
      }

      return this.mapToResponse(auditLog);
    } catch (error) {
      this.logger.error(
        `Failed to find audit log by id ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAuditLogsByTenant(tenantId: string): Promise<AuditLogResponse[]> {
    try {
      const auditLogs = Array.from(this.auditLogs.values()).filter(
        (log) => log.tenantId === tenantId,
      );

      this.logger.log(
        `Found ${auditLogs.length} audit logs for tenant: ${tenantId}`,
      );

      return auditLogs.map((log) => this.mapToResponse(log));
    } catch (error) {
      this.logger.error(
        `Failed to find audit logs for tenant ${tenantId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAuditLogsByActor(actor: string): Promise<AuditLogResponse[]> {
    try {
      const auditLogs = Array.from(this.auditLogs.values()).filter(
        (log) => log.actor === actor,
      );

      this.logger.log(
        `Found ${auditLogs.length} audit logs for actor: ${actor}`,
      );

      return auditLogs.map((log) => this.mapToResponse(log));
    } catch (error) {
      this.logger.error(
        `Failed to find audit logs for actor ${actor}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async buildAuditLog(
    dto: CreateAuditLogDto,
  ): Promise<Omit<AuditLog, 'createdAt' | 'updatedAt'>> {
    return {
      id: uuidv4(),
      timestamp: dto.timestamp,
      actor: dto.actor,
      tenantId: dto.tenantId,
      action: dto.action,
      entity: dto.entity,
      status: dto.status,
      metadata: dto.metadata || {},
    };
  }

  private async persistAuditLog(
    auditLog: Omit<AuditLog, 'createdAt' | 'updatedAt'>,
  ): Promise<AuditLog> {
    const now = new Date();
    const completeAuditLog: AuditLog = {
      ...auditLog,
      createdAt: now,
      updatedAt: now,
    };

    // In a real application, this would be persisted to a database
    this.auditLogs.set(completeAuditLog.id, completeAuditLog);

    return completeAuditLog;
  }

  private mapToResponse(auditLog: AuditLog): AuditLogResponse {
    return {
      id: auditLog.id,
      timestamp: auditLog.timestamp,
      actor: auditLog.actor,
      tenantId: auditLog.tenantId,
      action: auditLog.action,
      entity: auditLog.entity,
      status: auditLog.status,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt.toISOString(),
    };
  }
}
