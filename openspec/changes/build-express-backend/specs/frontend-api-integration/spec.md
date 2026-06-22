## ADDED Requirements

### Requirement: API client module
The frontend SHALL have an API client module at `idea-graph-app/src/api/projectsApi.ts` that wraps all backend API calls with proper error handling.

#### Scenario: API client provides CRUD methods
- **WHEN** the API client is imported
- **THEN** it exposes methods: listProjects, createProject, getProject, updateProject, deleteProject

### Requirement: Data source mode switching
The projectStore SHALL support a `dataSourceMode` setting (`local` | `api`) that determines whether data operations use localStorage or the backend API.

#### Scenario: Default mode is local
- **WHEN** the application starts without configuration
- **THEN** the data source mode defaults to `local` and uses localStorage

#### Scenario: Switch to API mode
- **WHEN** the data source mode is set to `api`
- **THEN** all project CRUD operations use the backend API instead of localStorage

### Requirement: Project list fetches from API
When in API mode, the project list page SHALL fetch projects from the backend API.

#### Scenario: Load projects from API
- **WHEN** IdeaListPage mounts in API mode
- **THEN** it fetches projects from `GET /Idea-Execution-Graph/api/projects` and displays them

### Requirement: Auto-save uses API
When in API mode, the editor page SHALL debounce snapshot changes and PUT to the backend API.

#### Scenario: Debounced auto-save
- **WHEN** the user edits the graph in API mode and stops for 800ms
- **THEN** the system sends a PUT request with the updated snapshot to the backend

#### Scenario: Save error handling
- **WHEN** a PUT request fails (network error or server error)
- **THEN** the system displays an error indicator to the user without losing local state

### Requirement: API base URL configuration
The frontend SHALL read the API base URL from an environment variable or configuration, defaulting to `http://localhost:4000`.

#### Scenario: Custom API URL
- **WHEN** `VITE_API_BASE_URL` is set to `https://my-server.com`
- **THEN** the API client uses `https://my-server.com/Idea-Execution-Graph/api/` as the base

#### Scenario: Default API URL
- **WHEN** no environment variable is set
- **THEN** the API client uses `http://localhost:4000/Idea-Execution-Graph/api/` as the base
