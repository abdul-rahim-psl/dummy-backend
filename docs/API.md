# API Documentation

## Audit Logging API

The Audit Logging API provides endpoints for creating and retrieving audit logs to track system activities and user actions.

### Base URL

```
http://localhost:3000
```

---

## Endpoints

### Create Audit Log

Create a new audit log entry to track system activities.

**Endpoint:** `POST /audit`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "timestamp": "2025-09-16T12:34:56Z",
  "actor": "user123",
  "tenantId": "bank01",
  "action": "DEPLOY_PACKAGE",
  "entity": "pacs008_endpoint",
  "status": "SUCCESS",
  "metadata": {
    "version": "v2",
    "hash": "sha256:abc123...",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "sess_abc123"
  }
}
```

**Request Body Schema:**

- `timestamp` (string, required): ISO 8601 timestamp of the event
- `actor` (string, required): Identifier of the user or system performing the action
- `tenantId` (string, required): Identifier of the tenant/organization
- `action` (enum, required): Type of action performed. Valid values:
  - `DEPLOY_PACKAGE`
  - `CREATE_ENTITY`
  - `UPDATE_ENTITY`
  - `DELETE_ENTITY`
  - `ACCESS_RESOURCE`
  - `AUTHENTICATE`
  - `AUTHORIZE`
- `entity` (string, required): The resource or entity being acted upon
- `status` (enum, required): Status of the action. Valid values:
  - `SUCCESS`
  - `FAILURE`
  - `PENDING`
- `metadata` (object, optional): Additional contextual information

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-09-16T12:34:56Z",
    "actor": "user123",
    "tenantId": "bank01",
    "action": "DEPLOY_PACKAGE",
    "entity": "pacs008_endpoint",
    "status": "SUCCESS",
    "metadata": {
      "version": "v2",
      "hash": "sha256:abc123...",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "sessionId": "sess_abc123"
    },
    "createdAt": "2025-09-16T12:34:56.123Z"
  },
  "message": "Audit log created successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "timestamp",
        "message": "timestamp must be a valid ISO 8601 date string"
      }
    ]
  },
  "timestamp": "2025-09-16T12:34:56.123Z"
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "success": false,
  "error": {
    "message": "Failed to create audit log",
    "code": "AUDIT_CREATION_FAILED",
    "details": "Database connection error"
  },
  "timestamp": "2025-09-16T12:34:56.123Z"
}
```

---

### Get Audit Log by ID

Retrieve a specific audit log by its unique identifier.

**Endpoint:** `GET /audit/:id`

**Path Parameters:**

- `id` (string, required): Unique identifier of the audit log

**Example Request:**

```
GET /audit/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-09-16T12:34:56Z",
    "actor": "user123",
    "tenantId": "bank01",
    "action": "DEPLOY_PACKAGE",
    "entity": "pacs008_endpoint",
    "status": "SUCCESS",
    "metadata": {
      "version": "v2",
      "hash": "sha256:abc123..."
    },
    "createdAt": "2025-09-16T12:34:56.123Z"
  },
  "message": "Audit log retrieved successfully"
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "message": "Audit log not found with id: 550e8400-e29b-41d4-a716-446655440000",
    "code": "AUDIT_LOG_NOT_FOUND"
  },
  "timestamp": "2025-09-16T12:34:56.123Z"
}
```

---

### Get Audit Logs

Retrieve audit logs filtered by tenant or actor.

**Endpoint:** `GET /audit`

**Query Parameters:**

- `tenantId` (string, optional): Filter logs by tenant identifier
- `actor` (string, optional): Filter logs by actor identifier

**Note:** Either `tenantId` or `actor` must be provided.

**Example Requests:**

```
GET /audit?tenantId=bank01
GET /audit?actor=user123
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-09-16T12:34:56Z",
      "actor": "user123",
      "tenantId": "bank01",
      "action": "DEPLOY_PACKAGE",
      "entity": "pacs008_endpoint",
      "status": "SUCCESS",
      "metadata": {
        "version": "v2",
        "hash": "sha256:abc123..."
      },
      "createdAt": "2025-09-16T12:34:56.123Z"
    }
  ],
  "message": "Found 1 audit logs"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "message": "Either tenantId or actor query parameter is required",
    "code": "MISSING_QUERY_PARAMETER"
  },
  "timestamp": "2025-09-16T12:34:56.123Z"
}
```

---

## Data Types

### AuditAction Enum

- `DEPLOY_PACKAGE`: Package deployment operation
- `CREATE_ENTITY`: Entity creation operation
- `UPDATE_ENTITY`: Entity update operation
- `DELETE_ENTITY`: Entity deletion operation
- `ACCESS_RESOURCE`: Resource access operation
- `AUTHENTICATE`: Authentication operation
- `AUTHORIZE`: Authorization operation

### AuditStatus Enum

- `SUCCESS`: Operation completed successfully
- `FAILURE`: Operation failed
- `PENDING`: Operation is in progress

### Metadata Object

The metadata object can contain any additional contextual information. Common fields include:

- `version`: Version identifier
- `hash`: Hash/checksum value
- `ipAddress`: Client IP address
- `userAgent`: Client user agent string
- `sessionId`: Session identifier
- `correlationId`: Request correlation identifier

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": "Additional error details (optional)"
  },
  "timestamp": "ISO 8601 timestamp"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUDIT_CREATION_FAILED`: Failed to create audit log
- `AUDIT_RETRIEVAL_FAILED`: Failed to retrieve audit log(s)
- `AUDIT_LOG_NOT_FOUND`: Audit log not found
- `MISSING_QUERY_PARAMETER`: Required query parameter missing

---

## Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
