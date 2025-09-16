# Postman Collection for Audit Logger API

This folder contains Postman collections and environments for testing the Audit Logger API endpoints.

## 📁 Files Included

- `Audit-Logger-API.postman_collection.json` - Main API collection with all endpoints
- `Local-Development.postman_environment.json` - Environment variables for local development

## 🚀 How to Import and Use

### 1. Import Collection

1. Open Postman
2. Click **Import** button
3. Select `Audit-Logger-API.postman_collection.json`
4. The collection will appear in your Collections panel

### 2. Import Environment

1. Click the **gear icon** (⚙️) in the top right
2. Click **Import**
3. Select `Local-Development.postman_environment.json`
4. Select the "Local Development" environment from the dropdown

### 3. Start Your Backend Server

Make sure your backend server is running:

```bash
cd /home/rahim/Downloads/feat-paysys-audit-logger/backend
npm run start:dev
```

## 📊 Collection Structure

### **Original Audit API**

- ✅ `POST /audit` - Create audit log (original implementation)
- ✅ `GET /audit/:id` - Get audit log by ID
- ✅ `GET /audit?tenantId=X` - Get logs by tenant
- ✅ `GET /audit?actor=X` - Get logs by actor

### **TCS Library Audit API**

- ✅ `POST /tcs-audit` - Create full audit log (TCS implementation)
- ✅ `POST /tcs-audit/success` - Quick success log creation
- ✅ `POST /tcs-audit/failure` - Quick failure log creation
- ✅ `GET /tcs-audit/:id` - Get TCS audit log by ID
- ✅ `GET /tcs-audit?tenantId=X` - Get TCS logs by tenant
- ✅ `GET /tcs-audit?actor=X` - Get TCS logs by actor

### **Test Data Examples**

- 🔐 Authentication Success Example
- ❌ Resource Access Failure Example
- 🚀 Package Deployment Example

## 🎯 Quick Testing Workflow

### **Test Original API:**

1. Run `Create Audit Log` (POST /audit)
2. Copy the returned ID from response
3. Use copied ID in `Get Audit Log by ID`
4. Test filtering with `Get Audit Logs by Tenant/Actor`

### **Test TCS Library API:**

1. Run `Create Full Audit Log (TCS)` (POST /tcs-audit)
2. Run `Create Success Log (TCS)` for quick success logging
3. Run `Create Failure Log (TCS)` for quick failure logging
4. Test retrieval endpoints with generated IDs

## 🔧 Environment Variables

The collection uses these variables (auto-configured in the environment):

| Variable       | Default Value           | Description                              |
| -------------- | ----------------------- | ---------------------------------------- |
| `base_url`     | `http://localhost:3000` | API base URL                             |
| `audit_id`     | (empty)                 | For testing specific audit log retrieval |
| `tcs_audit_id` | (empty)                 | For testing TCS audit log retrieval      |
| `tenant_id`    | `bank01`                | Default tenant for filtering             |
| `actor_name`   | `test_user`             | Default actor for filtering              |

## 📝 Sample Request Bodies

### Basic Audit Log

```json
{
  "timestamp": "2025-09-16T12:34:56Z",
  "actor": "user123",
  "tenantId": "bank01",
  "action": "DEPLOY_PACKAGE",
  "entity": "pacs008_endpoint",
  "status": "SUCCESS",
  "metadata": {
    "version": "v2.1.0",
    "sessionId": "sess_abc123"
  }
}
```

### TCS Success Log (Simplified)

```json
{
  "actor": "system_user",
  "tenantId": "bank03",
  "action": "DEPLOY_PACKAGE",
  "entity": "iso20022_transformer",
  "metadata": {
    "version": "v4.2.1",
    "environment": "production"
  }
}
```

## 🎨 Action Types Available

- `DEPLOY_PACKAGE` - Package deployment operations
- `CREATE_ENTITY` - Entity creation operations
- `UPDATE_ENTITY` - Entity update operations
- `DELETE_ENTITY` - Entity deletion operations
- `ACCESS_RESOURCE` - Resource access operations
- `AUTHENTICATE` - Authentication operations
- `AUTHORIZE` - Authorization operations

## 🏷️ Status Types Available

- `SUCCESS` - Operation completed successfully
- `FAILURE` - Operation failed
- `PENDING` - Operation in progress

## 🔍 Tips for Testing

1. **Auto ID Extraction**: The collection automatically extracts audit IDs from responses
2. **Use Variables**: Leverage environment variables for consistent testing
3. **Test Both APIs**: Compare original vs TCS library implementations
4. **Real-world Examples**: Use the "Test Data Examples" folder for realistic scenarios
5. **Check Console**: TCS library logs appear in your backend console

## 🐛 Troubleshooting

**Server not responding?**

- Ensure backend server is running on port 3000
- Check the environment `base_url` setting

**404 errors?**

- Verify endpoint paths match your server routes
- Check that both audit modules are properly loaded

**Validation errors?**

- Review request body schemas in the API documentation
- Ensure required fields are included

---

Happy testing! 🚀 Your audit logging API is ready to be tested thoroughly.
