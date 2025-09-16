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
import { AuditService } from '../services/audit.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import {
  CreateAuditLogResponse,
  ErrorResponse,
} from '../interfaces/audit-response.interface';

@Controller('audit')
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAuditLog(
    @Body(ValidationPipe) createAuditLogDto: CreateAuditLogDto,
  ): Promise<CreateAuditLogResponse> {
    try {
      this.logger.log(
        `Creating audit log for actor: ${createAuditLogDto.actor}`,
      );

      const auditLogResponse =
        await this.auditService.createAuditLog(createAuditLogDto);

      return {
        success: true,
        data: auditLogResponse,
        message: 'Audit log created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        this.buildErrorResponse(
          'Failed to create audit log',
          'AUDIT_CREATION_FAILED',
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
      this.logger.log(`Retrieving audit log with id: ${id}`);

      const auditLog = await this.auditService.findAuditLogById(id);

      if (!auditLog) {
        throw new HttpException(
          this.buildErrorResponse(
            `Audit log not found with id: ${id}`,
            'AUDIT_LOG_NOT_FOUND',
          ),
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: auditLog,
        message: 'Audit log retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to retrieve audit log: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        this.buildErrorResponse(
          'Failed to retrieve audit log',
          'AUDIT_RETRIEVAL_FAILED',
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
        this.logger.log(`Retrieving audit logs for tenant: ${tenantId}`);
        auditLogs = await this.auditService.findAuditLogsByTenant(tenantId);
      } else if (actor) {
        this.logger.log(`Retrieving audit logs for actor: ${actor}`);
        auditLogs = await this.auditService.findAuditLogsByActor(actor);
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
        message: `Found ${auditLogs.length} audit logs`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to retrieve audit logs: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        this.buildErrorResponse(
          'Failed to retrieve audit logs',
          'AUDIT_RETRIEVAL_FAILED',
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
