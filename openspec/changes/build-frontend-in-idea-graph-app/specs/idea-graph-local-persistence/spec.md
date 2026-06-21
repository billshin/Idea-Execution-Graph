## ADDED Requirements

### Requirement: Graph workspace state persists locally
The system SHALL persist nodes, edges, and workspace UI preferences to LocalStorage under a dedicated application key.

#### Scenario: Save workspace state
- **WHEN** graph or UI state changes
- **THEN** the system writes the latest serialized state to the application LocalStorage key

#### Scenario: Restore workspace state
- **WHEN** the user reloads the browser page
- **THEN** the system restores the most recent valid state from LocalStorage before first interactive render

### Requirement: Persisted payload is schema-versioned and validated
The system SHALL include a schema version in the persisted payload and SHALL validate payload shape before hydration.

#### Scenario: Handle unknown schema version
- **WHEN** LocalStorage contains a payload with unsupported schema version
- **THEN** the system skips hydration, initializes default state, and records a non-blocking warning

#### Scenario: Handle corrupted payload
- **WHEN** payload parsing or validation fails
- **THEN** the system initializes default state and keeps the UI functional without crashing

### Requirement: File references are metadata-only in MVP
The system SHALL store file references as metadata entries (id, name, url) and SHALL NOT store binary file content in LocalStorage.

#### Scenario: Persist file metadata
- **WHEN** a node includes file references
- **THEN** the system persists only file metadata fields and excludes binary content from serialized payload
