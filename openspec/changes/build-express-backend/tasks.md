## 1. Backend Project Setup

- [x] 1.1 Initialize `backend/` with package.json, tsconfig.json, and TypeScript dev dependencies
- [x] 1.2 Install dependencies: express, cors, pino, pino-http, zod, prisma, @prisma/client
- [x] 1.3 Create `backend/src/server.ts` (entry point) and `backend/src/app.ts` (Express app factory)
- [x] 1.4 Create `backend/src/config/env.ts` for environment variable loading (PORT, DATABASE_URL)
- [x] 1.5 Add npm scripts: dev (ts-node-dev), build (tsc), start (node dist/)

## 2. Prisma & Database

- [x] 2.1 Create `backend/prisma/schema.prisma` with Project model (id, title, subtitle, snapshotJson, createdAt, updatedAt)
- [ ] 2.2 Run initial migration to create SQLite database
- [x] 2.3 Create `backend/src/repositories/projects.repository.ts` with Prisma CRUD operations

## 3. Middleware & Error Handling

- [x] 3.1 Create `backend/src/middleware/error-handler.ts` (global error handler, structured JSON, no stack leak)
- [x] 3.2 Create `backend/src/middleware/not-found.ts` (404 handler for undefined routes)
- [x] 3.3 Configure CORS middleware in app.ts
- [x] 3.4 Configure pino-http request logging in app.ts

## 4. Health Check API

- [x] 4.1 Create `backend/src/routes/health.route.ts` with GET `/Idea-Execution-Graph/api/health`
- [x] 4.2 Create `backend/src/controllers/health.controller.ts` returning `{ ok, service, version }`

## 5. Project CRUD API

- [x] 5.1 Create `backend/src/schemas/project.schema.ts` with Zod schemas for create/update validation
- [x] 5.2 Create `backend/src/services/projects.service.ts` (business logic layer)
- [x] 5.3 Create `backend/src/controllers/projects.controller.ts` (request handling, validation, response)
- [x] 5.4 Create `backend/src/routes/projects.route.ts` with all CRUD routes under `/Idea-Execution-Graph/api/projects`
- [x] 5.5 Register all routes in app.ts with correct prefix

## 6. Backend Verification

- [ ] 6.1 Start server and verify health check endpoint returns expected response
- [ ] 6.2 Test project CRUD flow: create → list → get → update → delete
- [ ] 6.3 Verify validation errors return 400 with meaningful messages

## 7. Frontend API Client

- [x] 7.1 Create `idea-graph-app/src/api/projectsApi.ts` with typed CRUD methods (fetch-based)
- [x] 7.2 Add `VITE_API_BASE_URL` to Vite env config, default to `http://localhost:4000`

## 8. Frontend Data Source Switching

- [x] 8.1 Add `dataSourceMode: 'local' | 'api'` to projectStore state
- [x] 8.2 Modify `createProject` to call API when mode is `api`
- [x] 8.3 Modify `deleteProject` to call API when mode is `api`
- [x] 8.4 Modify `initializeProjects` to fetch from API when mode is `api`
- [x] 8.5 Modify editor auto-save effect to PUT via API with 800ms debounce when mode is `api`

## 9. Integration Verification

- [ ] 9.1 Start backend + frontend, switch to API mode, verify project creation
- [ ] 9.2 Verify editor auto-save persists to database
- [ ] 9.3 Verify project list loads from API on page refresh
- [ ] 9.4 Add README section for backend setup and startup instructions
