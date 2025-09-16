import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
}

export enum AuditAction {
  DEPLOY_PACKAGE = 'DEPLOY_PACKAGE',
  CREATE_ENTITY = 'CREATE_ENTITY',
  UPDATE_ENTITY = 'UPDATE_ENTITY',
  DELETE_ENTITY = 'DELETE_ENTITY',
  ACCESS_RESOURCE = 'ACCESS_RESOURCE',
  AUTHENTICATE = 'AUTHENTICATE',
  AUTHORIZE = 'AUTHORIZE',
}

export interface AuditMetadata {
  version?: string;
  hash?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
  [key: string]: unknown;
}

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
