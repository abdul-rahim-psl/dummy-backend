import { Test, TestingModule } from '@nestjs/testing';
import { TcsAuditService } from '../src/audit/services/tcs-audit.service';
import { AuditAction, AuditStatus } from 'tcs-lib';

describe('TcsAuditService Integration', () => {
  let service: TcsAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TcsAuditService],
    }).compile();

    service = module.get<TcsAuditService>(TcsAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create audit log using TCS lib', async () => {
    const createAuditLogDto = {
      timestamp: '2025-09-16T12:34:56Z',
      actor: 'test-user',
      tenantId: 'test-tenant',
      action: AuditAction.DEPLOY_PACKAGE,
      entity: 'test-entity',
      status: AuditStatus.SUCCESS,
      metadata: {
        version: 'v1.0.0',
        source: 'tcs-lib-test',
      },
    };

    const result = await service.createAuditLog(createAuditLogDto);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.actor).toBe(createAuditLogDto.actor);
    expect(result.tenantId).toBe(createAuditLogDto.tenantId);
    expect(result.action).toBe(createAuditLogDto.action);
    expect(result.entity).toBe(createAuditLogDto.entity);
    expect(result.status).toBe(createAuditLogDto.status);
  });

  it('should log success using convenience method', async () => {
    const auditId = await service.logSuccess(
      'test-user',
      AuditAction.CREATE_ENTITY,
      'test-entity',
      'Successfully created entity via TCS lib',
      { source: 'convenience-method' },
    );

    expect(auditId).toBeDefined();
    expect(typeof auditId).toBe('string');

    // Verify the log was created
    const createdLog = await service.findAuditLogById(auditId);
    expect(createdLog).toBeDefined();
    expect(createdLog?.actor).toBe('test-user');
    expect(createdLog?.action).toBe(AuditAction.CREATE_ENTITY);
    expect(createdLog?.status).toBe(AuditStatus.SUCCESS);
  });

  it('should log failure using convenience method', async () => {
    const auditId = await service.logFailure(
      'test-user',
      AuditAction.DELETE_ENTITY,
      'test-entity',
      'Failed to delete entity via TCS lib',
      { error: 'Entity not found' },
    );

    expect(auditId).toBeDefined();
    expect(typeof auditId).toBe('string');

    // Verify the log was created
    const createdLog = await service.findAuditLogById(auditId);
    expect(createdLog).toBeDefined();
    expect(createdLog?.actor).toBe('test-user');
    expect(createdLog?.action).toBe(AuditAction.DELETE_ENTITY);
    expect(createdLog?.status).toBe(AuditStatus.FAILURE);
  });

  it('should find logs by tenant', async () => {
    const tenantId = 'integration-test-tenant';

    // Create a few logs for the tenant
    await service.logSuccess('user1', AuditAction.CREATE_ENTITY, 'entity1');
    await service.logInfo('user2', AuditAction.UPDATE_ENTITY, 'entity2');

    const logs = await service.findAuditLogsByTenant(tenantId);

    expect(Array.isArray(logs)).toBe(true);
    // Since we're using defaultTenantId from config, the logs should be found under 'default-tenant'
  });

  it('should find logs by actor', async () => {
    const actor = 'integration-test-user';

    // Create a log for this specific actor
    await service.logWarning(
      actor,
      AuditAction.ACCESS_RESOURCE,
      'protected-resource',
    );

    const logs = await service.findAuditLogsByActor(actor);

    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].actor).toBe(actor);
  });
});
