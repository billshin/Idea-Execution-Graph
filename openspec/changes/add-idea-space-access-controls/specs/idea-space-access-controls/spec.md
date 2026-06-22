## ADDED Requirements

### Requirement: Project access mode resolution
The system SHALL resolve access mode when opening a project using configured Idea Space password settings.

#### Scenario: Password prompt is required only when passwords are configured
- **WHEN** a user opens a project and either `viewPassword` or `editPassword` hash is configured
- **THEN** the system MUST request one password input before entering the editor

#### Scenario: Edit password grants edit mode
- **WHEN** entered password matches the `editPassword` hash
- **THEN** the system MUST open the editor in edit mode

#### Scenario: View password grants read-only mode
- **WHEN** entered password does not match `editPassword` but matches `viewPassword`
- **THEN** the system MUST open the editor in read-only mode

#### Scenario: No password keeps default mode behavior
- **WHEN** neither `viewPassword` nor `editPassword` is configured
- **THEN** the system MUST open using default mode resolution (`readOnly=true` => read-only, otherwise edit)

### Requirement: Read-only enforcement
The system SHALL block all snapshot-mutating actions in read-only mode.

#### Scenario: Mutating editor actions are blocked in read-only mode
- **WHEN** session mode is read-only
- **THEN** the system MUST prevent node/edge create, update, delete, drag, parking lot edits, and Idea Space edits

#### Scenario: Read-only hides edit password field
- **WHEN** the project is shown in read-only mode
- **THEN** the UI MUST NOT display the edit-password input field or existing edit-password value

### Requirement: Project deletion password verification
The system SHALL require password validation for protected project deletion from homepage cards.

#### Scenario: Protected project delete requires valid password
- **WHEN** a user clicks delete on a project that has `viewPassword` or `editPassword` configured
- **THEN** the system MUST require one password input and delete only if it matches `editPassword` or `viewPassword` by configured verification order

#### Scenario: Public project delete does not require password
- **WHEN** a user clicks delete on a project with no configured passwords
- **THEN** the system MUST allow delete after existing confirmation without password prompt

### Requirement: Password storage handling
The system SHALL persist password protections as salted hash values only.

#### Scenario: Password values are not stored as plaintext
- **WHEN** a project password is created or changed
- **THEN** the system MUST store only hash and per-project salt values and MUST NOT persist plaintext passwords

#### Scenario: Password values are not re-displayed
- **WHEN** a user reopens a project configuration view
- **THEN** password inputs MUST remain empty and MUST NOT reveal stored password content
