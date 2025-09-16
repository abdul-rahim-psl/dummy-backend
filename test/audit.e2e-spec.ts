import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuditModule } from '../src/audit/audit.module';
import {
  AuditAction,
  AuditStatus,
} from '../src/audit/dto/create-audit-log.dto';

describe('AuditController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuditModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/audit (POST)', () => {
    it('should create an audit log successfully', () => {
      const createAuditLogDto = {
        timestamp: '2025-09-16T12:34:56Z',
        actor: 'user123',
        tenantId: 'bank01',
        action: AuditAction.DEPLOY_PACKAGE,
        entity: 'pacs008_endpoint',
        status: AuditStatus.SUCCESS,
        metadata: {
          version: 'v2',
          hash: 'sha256:abc123...',
        },
      };

      return request(app.getHttpServer())
        .post('/audit')
        .send(createAuditLogDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.actor).toBe(createAuditLogDto.actor);
          expect(res.body.data.tenantId).toBe(createAuditLogDto.tenantId);
          expect(res.body.message).toBe('Audit log created successfully');
        });
    });

    it('should return validation error for invalid data', () => {
      const invalidDto = {
        actor: 'user123',
        // Missing required fields
      };

      return request(app.getHttpServer())
        .post('/audit')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/audit/:id (GET)', () => {
    it('should return 404 for non-existent audit log', () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      return request(app.getHttpServer())
        .get(`/audit/${nonExistentId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('AUDIT_LOG_NOT_FOUND');
        });
    });
  });

  describe('/audit (GET)', () => {
    it('should return 400 when no query parameters provided', () => {
      return request(app.getHttpServer())
        .get('/audit')
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('MISSING_QUERY_PARAMETER');
        });
    });

    it('should return empty array for non-existent tenant', () => {
      return request(app.getHttpServer())
        .get('/audit?tenantId=nonexistent')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual([]);
        });
    });
  });
});
