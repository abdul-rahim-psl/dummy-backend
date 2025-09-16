import { Injectable, Logger } from '@nestjs/common';
import {
  createAuditLogger,
  AuditAction,
  AuditStatus,
  AuditLoggerConfig,
  IAuditLogger,
} from 'tcs-lib';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLogResponse } from '../interfaces/audit-response.interface';

@Injectable()
export class TcsAuditService {
  private readonly logger = new Logger(TcsAuditService.name);
  private readonly auditLogger: IAuditLogger;

  constructor() {
    const config: AuditLoggerConfig = {
      serviceName: 'dummy-backend-api',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      defaultTenantId: 'default-tenant',
      enableConsoleOutput: true,
      enableFileOutput: false,
    };

    this.auditLogger = createAuditLogger(config);
    this.logger.log('TCS Audit Logger initialized successfully');
  }

  async createAuditLog(
    createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLogResponse> {
    try {
      const auditId = await this.auditLogger.log({
        actor: createAuditLogDto.actor,
        tenantId: createAuditLogDto.tenantId,
        action: createAuditLogDto.action as AuditAction,
        entity: createAuditLogDto.entity,
        status: createAuditLogDto.status as AuditStatus,
        message: `Audit log created for ${createAuditLogDto.action} on ${createAuditLogDto.entity}`,
        metadata: createAuditLogDto.metadata,
      });

      // Get the created log back to return as response
      const createdLog = await this.auditLogger.getLogById(auditId);

      if (!createdLog) {
        throw new Error('Failed to retrieve created audit log');
      }

      this.logger.log(`Audit log created successfully with ID: ${auditId}`);

      return this.mapToResponse(createdLog);
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
      const auditLog = await this.auditLogger.getLogById(id);
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
      const auditLogs = await this.auditLogger.getLogs({ tenantId });

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
      const auditLogs = await this.auditLogger.getLogs({ actor });

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

  // Convenience methods using TCS lib directly
  async logSuccess(
    actor: string,
    action: AuditAction,
    entity: string,
    message?: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    return await this.auditLogger.logSuccess(
      actor,
      action,
      entity,
      message,
      metadata,
    );
  }

  async logFailure(
    actor: string,
    action: AuditAction,
    entity: string,
    message?: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    return await this.auditLogger.logFailure(
      actor,
      action,
      entity,
      message,
      metadata,
    );
  }

  async logInfo(
    actor: string,
    action: AuditAction,
    entity: string,
    message?: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    return await this.auditLogger.logInfo(
      actor,
      action,
      entity,
      message,
      metadata,
    );
  }

  async logWarning(
    actor: string,
    action: AuditAction,
    entity: string,
    message?: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    return await this.auditLogger.logWarning(
      actor,
      action,
      entity,
      message,
      metadata,
    );
  }

  async logError(
    actor: string,
    action: AuditAction,
    entity: string,
    message?: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    return await this.auditLogger.logError(
      actor,
      action,
      entity,
      message,
      metadata,
    );
  }

  private mapToResponse(auditLog: any): AuditLogResponse {
    return {
      id: auditLog.id,
      timestamp: auditLog.timestamp,
      actor: auditLog.actor,
      tenantId: auditLog.tenantId,
      action: auditLog.action,
      entity: auditLog.entity,
      status: auditLog.status,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt?.toISOString() || auditLog.timestamp,
    };
  }
}
