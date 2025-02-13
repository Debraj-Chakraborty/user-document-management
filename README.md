# User Document Management

## Database Setup

This project uses **PostgreSQL** as the database.

### Steps to Run the Project:
1. Create a `.env` file in the project root. The required configuration can be found in `sample-env.txt`.
2. Create a PostgreSQL database named **`user_document_management`**.
3. Create a schema named **`user_document_management`** in the database.
4. Run `dml.sql` to add roles.

### Automatic Table Creation:
- To create tables automatically, set the following in your `.env` file:
  ```env
  API_DEV_MODE='true'
  ```
- In **production mode**, tables need to be created manually using the **DDL statements** provided in `ddl.sql`.

## API Documentation
Swagger documentation is included for reference. Once the project is running, you can access it at:
```
http://localhost:3210/api-docs
```

## Deployment
If you want to host the application on a server, the following files are included:
- **Dockerfile** (`Dockerfile.nodejs`) for containerization.
- **Ansible build script** (`docker-build-ansible.yml`).
- **Kubernetes pod configuration** (`user-document-management.yaml`).

## Installation

```bash
$ npm install
```

## Running the App

```bash
# Development mode
$ npm run start

# Watch mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## Testing

```bash
# Unit tests
$ npm run test

# End-to-End (E2E) tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```
