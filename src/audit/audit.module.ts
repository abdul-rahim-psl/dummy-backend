import { Module } from '@nestjs/common';
import { AuditController } from './controllers/audit.controller';
import { TcsAuditController } from './controllers/tcs-audit.controller';
import { AuditService } from './services/audit.service';
import { TcsAuditService } from './services/tcs-audit.service';

@Module({
  controllers: [AuditController, TcsAuditController],
  providers: [AuditService, TcsAuditService],
  exports: [AuditService, TcsAuditService],
})
export class AuditModule {}
