## ADDED Requirements

### Requirement: Users can undo recent graph and edit operations
The system SHALL support undo of recent graph mutations and edit commits via keyboard shortcut Ctrl+Z.

#### Scenario: Undo node deletion
- **WHEN** the user deletes a node and presses Ctrl+Z
- **THEN** the system restores the deleted node and its previously connected edges

#### Scenario: Undo field edit
- **WHEN** the user commits a node field edit and presses Ctrl+Z
- **THEN** the system restores the node field values to the previous committed snapshot

### Requirement: Undo stack is bounded and deterministic
The system SHALL maintain a bounded undo history with predictable operation order.

#### Scenario: Exceed history limit
- **WHEN** the number of recorded operations exceeds the configured history size
- **THEN** the system drops the oldest history entry and keeps the newest entries in order
