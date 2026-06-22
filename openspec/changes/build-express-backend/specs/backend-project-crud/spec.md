## ADDED Requirements

### Requirement: Project data model
The system SHALL store projects using Prisma with the following fields: id (UUID), title (string), subtitle (string), snapshotJson (JSON), createdAt (datetime), updatedAt (datetime).

#### Scenario: Project record structure
- **WHEN** a project is created in the database
- **THEN** it contains all required fields with auto-generated id, createdAt, and updatedAt

### Requirement: List all projects
The system SHALL return all projects ordered by updatedAt descending via `GET /Idea-Execution-Graph/api/projects`.

#### Scenario: Successful project list
- **WHEN** a GET request is made to `/Idea-Execution-Graph/api/projects`
- **THEN** the system returns HTTP 200 with an array of projects sorted by updatedAt desc

#### Scenario: Empty project list
- **WHEN** no projects exist in the database
- **THEN** the system returns HTTP 200 with an empty array `[]`

### Requirement: Create a project
The system SHALL create a new project via `POST /Idea-Execution-Graph/api/projects` with Zod-validated request body.

#### Scenario: Successful project creation
- **WHEN** a POST request is made with valid body `{ title: "My Idea", snapshot: {...} }`
- **THEN** the system returns HTTP 201 with the created project including generated id and timestamps

#### Scenario: Missing required field
- **WHEN** a POST request is made without a `title` field
- **THEN** the system returns HTTP 400 with a validation error message

### Requirement: Get a single project
The system SHALL return a single project by id via `GET /Idea-Execution-Graph/api/projects/:id`.

#### Scenario: Project found
- **WHEN** a GET request is made with a valid existing project id
- **THEN** the system returns HTTP 200 with the full project data

#### Scenario: Project not found
- **WHEN** a GET request is made with a non-existing id
- **THEN** the system returns HTTP 404 with `{ "error": "Project not found" }`

### Requirement: Update a project
The system SHALL update a project via `PUT /Idea-Execution-Graph/api/projects/:id` with partial body.

#### Scenario: Successful update
- **WHEN** a PUT request is made with valid body `{ title: "Updated Title" }`
- **THEN** the system returns HTTP 200 with the updated project and refreshed updatedAt

#### Scenario: Update snapshot
- **WHEN** a PUT request is made with `{ snapshot: {...} }`
- **THEN** the system replaces the stored snapshotJson with the new snapshot

#### Scenario: Update non-existing project
- **WHEN** a PUT request is made to a non-existing project id
- **THEN** the system returns HTTP 404 with `{ "error": "Project not found" }`

### Requirement: Delete a project
The system SHALL delete a project via `DELETE /Idea-Execution-Graph/api/projects/:id`.

#### Scenario: Successful deletion
- **WHEN** a DELETE request is made with a valid existing project id
- **THEN** the system returns HTTP 204 with no body

#### Scenario: Delete non-existing project
- **WHEN** a DELETE request is made with a non-existing id
- **THEN** the system returns HTTP 404 with `{ "error": "Project not found" }`
