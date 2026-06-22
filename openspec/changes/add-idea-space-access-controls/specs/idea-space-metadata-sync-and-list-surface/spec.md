## ADDED Requirements

### Requirement: Idea Space metadata model extension
The system SHALL support `category`, `author`, and `readOnly` metadata as Idea Space fields across project lifecycle.

#### Scenario: New project stores extended Idea Space metadata
- **WHEN** a user creates a project from the homepage form with metadata inputs
- **THEN** the new project snapshot MUST initialize `ideaSpace` with provided `category`, `author`, and `readOnly` values

#### Scenario: Existing project missing metadata is normalized
- **WHEN** an older project is loaded without the new fields
- **THEN** the system MUST normalize missing fields to defaults without load failure

### Requirement: Homepage and editor metadata synchronization
The system SHALL keep homepage create inputs and editor Idea Space values consistent at project initialization.

#### Scenario: Homepage title and subtitle remain synchronized with Idea Space base fields
- **WHEN** a project is created from homepage title/subtitle inputs
- **THEN** snapshot `ideaSpace.title` and `ideaSpace.subtitle` MUST be initialized from those values

#### Scenario: Extended fields are editable from Idea Space panel
- **WHEN** a user edits `category`, `author`, or `readOnly` in the Idea Space panel
- **THEN** the changes MUST be persisted in the project snapshot through existing autosave flow

### Requirement: Homepage project card metadata display
The system SHALL display selected Idea Space metadata on homepage project cards.

#### Scenario: Card shows metadata summary
- **WHEN** a project card is rendered in the homepage list
- **THEN** the card MUST show a metadata summary including `category`, `author`, and read-only state

#### Scenario: Card does not expose password fields
- **WHEN** project card metadata is displayed
- **THEN** `viewPassword` and `editPassword` values or hashes MUST NOT be shown

### Requirement: Idea Space help disclosure for mode behavior
The system SHALL provide contextual help that explains password and mode combinations.

#### Scenario: Help text is shown on demand
- **WHEN** a user clicks the `?` help control in Idea Space
- **THEN** the UI MUST display the configured mode matrix for public, read-only, view-password, and edit-password combinations
