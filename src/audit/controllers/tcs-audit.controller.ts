import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpException,
  ValidationPipe,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { TcsAuditService } from '../services/tcs-audit.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import {
  CreateAuditLogResponse,
  ErrorResponse,
} from '../interfaces/audit-response.interface';
import { AuditAction } from 'tcs-lib';

@Controller('tcs-audit')
export class TcsAuditController {
  private readonly logger = new Logger(TcsAuditController.name);

  constructor(private readonly tcsAuditService: TcsAuditService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAuditLog(
    @Body(ValidationPipe) createAuditLogDto: CreateAuditLogDto,
  ): Promise<CreateAuditLogResponse> {
    try {
      this.logger.log(
        `Creating TCS audit log for actor: ${createAuditLogDto.actor}`,
      );

      const auditLogResponse =
        await this.tcsAuditService.createAuditLog(createAuditLogDto);

      return {
        success: true,
        data: auditLogResponse,
        message: 'TCS audit log created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create TCS audit log: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        this.buildErrorResponse(
          'Failed to create TCS audit log',
          'TCS_AUDIT_CREATION_FAILED',
          error.message,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getAuditLogById(
    @Param('id') id: string,
  ): Promise<CreateAuditLogResponse | ErrorResponse> {
    try {
      this.logger.log(`Retrieving TCS audit log with id: ${id}`);

      const auditLog = await this.tcsAuditService.findAuditLogById(id);

      if (!auditLog) {
        throw new HttpException(
          this.buildErrorResponse(
            `TCS audit log not found with id: ${id}`,
            'TCS_AUDIT_LOG_NOT_FOUND',
          ),
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: auditLog,
        message: 'TCS audit log retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to retrieve TCS audit log: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        this.buildErrorResponse(
          'Failed to retrieve TCS audit log',
          'TCS_AUDIT_RETRIEVAL_FAILED',
          error.message,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAuditLogs(
    @Query('tenantId') tenantId?: string,
    @Query('actor') actor?: string,
  ): Promise<{ success: boolean; data: any[]; message: string }> {
    try {
      let auditLogs: any[] = [];

      if (tenantId) {
        this.logger.log(`Retrieving TCS audit logs for tenant: ${tenantId}`);
        auditLogs = await this.tcsAuditService.findAuditLogsByTenant(tenantId);
      } else if (actor) {
        this.logger.log(`Retrieving TCS audit logs for actor: ${actor}`);
        auditLogs = await this.tcsAuditService.findAuditLogsByActor(actor);
      } else {
        throw new HttpException(
          this.buildErrorResponse(
            'Either tenantId or actor query parameter is required',
            'MISSING_QUERY_PARAMETER',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        success: true,
        data: auditLogs,
        message: `Found ${auditLogs.length} TCS audit logs`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to retrieve TCS audit logs: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        this.buildErrorResponse(
          'Failed to retrieve TCS audit logs',
          'TCS_AUDIT_RETRIEVAL_FAILED',
          error.message,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Convenience endpoints for different log types
  @Post('success')
  @HttpCode(HttpStatus.CREATED)
  async logSuccess(
    @Body()
    body: {
      actor: string;
      action: AuditAction;
      entity: string;
      message?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    try {
      const auditId = await this.tcsAuditService.logSuccess(
        body.actor,
        body.action,
        body.entity,
        body.message,
        body.metadata,
      );

      return {
        success: true,
        data: { auditId },
        message: 'Success audit log created',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create success audit log: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        this.buildErrorResponse(
          'Failed to create success audit log',
          'TCS_SUCCESS_LOG_FAILED',
          error.message,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('failure')
  @HttpCode(HttpStatus.CREATED)
  async logFailure(
    @Body()
    body: {
      actor: string;
      action: AuditAction;
      entity: string;
      message?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    try {
      const auditId = await this.tcsAuditService.logFailure(
        body.actor,
        body.action,
        body.entity,
        body.message,
        body.metadata,
      );

      return {
        success: true,
        data: { auditId },
        message: 'Failure audit log created',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create failure audit log: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        this.buildErrorResponse(
          'Failed to create failure audit log',
          'TCS_FAILURE_LOG_FAILED',
          error.message,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildErrorResponse(
    message: string,
    code: string,
    details?: string,
  ): ErrorResponse {
    return {
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
