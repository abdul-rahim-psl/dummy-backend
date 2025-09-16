export interface AuditLogResponse {
  id: string;
  timestamp: string;
  actor: string;
  tenantId: string;
  action: string;
  entity: string;
  status: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateAuditLogResponse {
  success: boolean;
  data: AuditLogResponse;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
  timestamp: string;
}
