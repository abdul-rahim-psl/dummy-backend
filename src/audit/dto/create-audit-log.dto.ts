import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuditStatus, AuditAction } from 'tcs-lib';
import type { AuditMetadata } from 'tcs-lib';

export class CreateAuditLogDto {
  @IsISO8601()
  @IsNotEmpty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  actor: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @IsString()
  @IsNotEmpty()
  entity: string;

  @IsEnum(AuditStatus)
  @IsNotEmpty()
  status: AuditStatus;

  @IsObject()
  @IsOptional()
  @Type(() => Object)
  metadata?: AuditMetadata;
}

// Re-export the enums for backward compatibility
export { AuditStatus, AuditAction } from 'tcs-lib';
