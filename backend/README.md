# ELV CONNECT Backend

This is the backend service for ELV CONNECT, a platform for managing jobs, invoices, and service providers.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express with TypeScript
- **Database**: MongoDB (Atlas) with Mongoose
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Tokens)

## Key Features
- **Auth Module**: Secure registration and login with encrypted passwords.
- **Jobs Module**: Create, update, list, and soft-delete job postings.
- **Applications Module**: Manage job applications from service providers.
- **Invoices Module**: Automated invoice generation and payment tracking.
- **E2E Testing**: Comprehensive audit script for verifying business logic.

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file based on `.env.example`.

### Running the App
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Running Tests
To run the complete E2E audit:
```bash
node e2e_complete_audit.js
```

## API Documentation
Detailed API documentation can be found in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).
