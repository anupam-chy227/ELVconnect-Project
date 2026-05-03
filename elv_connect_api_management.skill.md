# ELV CONNECT - API Management Skill

This skill provides a comprehensive audit and testing workflow for the ELV CONNECT Backend, MongoDB, and Postman integrations.

## 🛠 Prerequisites
1. **Backend**: Ensure `npm run dev` is running on port 5000.
2. **Postman**: Ensure the `ELV CONNECT - Dev` environment is selected in your Postman UI.
3. **MCP**: Ensure MongoDB and Postman MCP servers are connected.

## 📋 Execution Steps

### 1. Backend Health Audit
Run a health check to ensure the API is listening and responding.
- Endpoint: `http://localhost:5000/health`
- Expected: `{"status":"ok"}`

### 2. MongoDB Connectivity Check
Verify that the Atlas cluster is reachable and the `ELV_connect` database is accessible.
- Action: List databases using `mongodb-mcp-server`.
- Action: Count users in `users` collection to verify read access.

### 3. Postman Collection Validation
Ensure the unified collection is up-to-date and organized.
- Collection: `ELV CONNECT - Unified API v1.2`
- Action: List all requests to verify coverage (25+ endpoints).

### 4. Full API Test Suite Run
Execute the entire collection run to identify any breaking changes in the API logic.
- Action: Use `runCollection` with `ELV CONNECT - Unified API v1.2` and `ELV CONNECT - Dev` environment.
- Success Criteria: 0 Failed requests.

## ⚠️ Troubleshooting
- **DNSLookup: EBADNAME**: This means the Postman environment is not selected. Switch from "No environment" to "ELV CONNECT - Dev" in the top-right corner.
- **MongooseServerSelectionError**: Check if your current IP is whitelisted in MongoDB Atlas.
- **Port 5000 busy**: Restart the backend or kill the process using `netstat -ano | findstr :5000`.

---
*Created by Antigravity for ELV CONNECT Project.*
