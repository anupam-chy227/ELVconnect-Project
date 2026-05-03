# ELV CONNECT - Backend API Documentation

This document outlines the API endpoints, logic workflows, and test scenarios for the ELV CONNECT backend.

## 🚀 Getting Started

### 1. Database Connection (CRITICAL)
If you see an **SSL alert number 80** error, your IP is not whitelisted in MongoDB Atlas.
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Go to **Network Access** (under Security).
3. Click **Add IP Address**.
4. Click **Add Current IP Address** or **Allow Access from Anywhere** (0.0.0.0/0).
5. Click **Confirm**.

### 2. Running the Audit
To verify the entire business logic (Auth -> Job -> Application -> Invoice -> Payment -> Delete), run:
```bash
cd backend
npm run test:e2e
```

---

## 🛠 API Workflows & Scenarios

### 1. Authentication
| Scenario | Endpoint | Expected Result |
| :--- | :--- | :--- |
| Register Customer | `POST /auth/register/customer` | 201 Created |
| Register SP | `POST /auth/register/service-provider` | 201 Created |
| Login | `POST /auth/login` | 200 OK + JWT Tokens |
| Invalid Password | `POST /auth/login` | 401 Unauthorized |

### 2. Jobs & Applications
| Scenario | Endpoint | Logic |
| :--- | :--- | :--- |
| Post Job | `POST /jobs` | Customer creates a job. Status: `open`. |
| Apply to Job | `POST /jobs/:id/apply` | SP applies. Status: `applications_received`. |
| Accept Application | `PATCH /jobs/:id/application` | Customer accepts SP. Status: `in_progress`. Other SPs rejected. |
| Discard Job | `DELETE /jobs/:id` | **Soft Delete**. `isDeleted` set to true. Hidden from lists. |

### 3. Invoices & Payments
| Scenario | Endpoint | Logic |
| :--- | :--- | :--- |
| Create Invoice | `POST /invoices` | SP bills customer. Status: `sent`. |
| Record Payment | `POST /invoices/:id/payments` | SP marks as paid. Status: `paid`. Balance: 0. |
| Partial Payment | `POST /invoices/:id/payments` | Status: `partially_paid`. Balance updated. |

---

## 🛑 Error Possibilities & Handling
- **404 Not Found**: Attempting to access a deleted job or non-existent resource.
- **400 Bad Request**: SP applying to their own job or a closed job.
- **401 Unauthorized**: Missing or expired JWT token.
- **409 Conflict**: Duplicate application from the same SP.

---

## 🔍 Database Verification
The audit script (`e2e_complete_audit.js`) automatically verifies the database state via API returns:
1. `Job.status` changes from `open` -> `applications_received` -> `in_progress`.
2. `Invoice.status` changes from `sent` -> `paid`.
3. `Job.isDeleted` is respected (resource becomes inaccessible via API).
