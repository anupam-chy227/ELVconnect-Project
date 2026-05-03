# Rule: API Documentation Synchronization

**Goal**: Ensure that the technical documentation and management skills always reflect the current state of the API.

## 🛡 Mandatory Trigger
Whenever any of the following files are created or modified:
- `src/modules/**/*.controller.ts`
- `src/modules/**/*.routes.ts`
- `src/modules/**/*.service.ts`
- `src/modules/**/*.model.ts`

## 📋 Required Actions
1. **Analyze Changes**: Identify new endpoints, changed request/response schemas, or updated business logic (e.g., status transitions).
2. **Sync Developer Docs**: Update `backend/API_DEVELOPER_DOCS.md` with:
    - New/Updated status codes.
    - Updated scenarios (Approve, Discard, Change).
    - New error possibilities.
3. **Sync Management Skill**: Update `elv_connect_api_management.skill.md` if the health check or testing workflow has changed.
4. **Postman Update**: Inform the user to sync the Postman collection if new endpoints were added.

## 🚦 Verification
Before completing any task that involves API changes, verify that the documentation files have been reviewed and updated accordingly.

---
*Enforced by ELV CONNECT Development Standards.*
