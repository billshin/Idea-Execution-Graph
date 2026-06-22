## ADDED Requirements

### Requirement: Health check endpoint
The system SHALL expose a health check endpoint at `GET /Idea-Execution-Graph/api/health` that returns server status.

#### Scenario: Health check returns OK
- **WHEN** a GET request is made to `/Idea-Execution-Graph/api/health`
- **THEN** the system returns HTTP 200 with body `{ "ok": true, "service": "idea-graph-api", "version": "v1" }`

### Requirement: Express application structure
The backend SHALL be structured as an Express + TypeScript application in the `backend/` directory with separate layers for routes, controllers, services, and repositories.

#### Scenario: Application starts successfully
- **WHEN** the backend is started via `npm run dev`
- **THEN** the Express server listens on the configured port (default 4000)

#### Scenario: Unknown route returns 404
- **WHEN** a request is made to an undefined route
- **THEN** the system returns HTTP 404 with body `{ "error": "Not Found" }`

### Requirement: Global error handling
The system SHALL catch unhandled errors and return a structured JSON response without leaking stack traces in production.

#### Scenario: Unhandled error in handler
- **WHEN** a route handler throws an unexpected error
- **THEN** the system returns HTTP 500 with body `{ "error": "Internal Server Error" }` and logs the error via pino

### Requirement: CORS configuration
The system SHALL allow cross-origin requests from the frontend origin during development.

#### Scenario: CORS preflight request
- **WHEN** an OPTIONS request is made from `http://localhost:5173`
- **THEN** the system returns appropriate CORS headers allowing the request

### Requirement: Request logging
The system SHALL log all incoming requests with method, path, status code, and response time.

#### Scenario: Request is logged
- **WHEN** any request is processed
- **THEN** the system logs the request details via pino
