## ADDED Requirements

### Requirement: Users can create and connect idea nodes
The system SHALL allow users to create nodes from the canvas or from an existing node, and SHALL allow users to create directed edges between node connection points.

#### Scenario: Create node from blank area
- **WHEN** the user triggers add-node on an empty canvas area
- **THEN** the system creates a new node with default title `START`, status `open`, and a stable unique id

#### Scenario: Connect two nodes
- **WHEN** the user drags a connector from one node endpoint to another compatible endpoint
- **THEN** the system creates a directed edge with unique id and persists source/target references to existing node ids

### Requirement: Users can edit core node details
The system SHALL provide editable fields for title, subtitle, target date, conclusion, markdown content, labels, and status for each node.

#### Scenario: Update node details
- **WHEN** the user saves edits in the node detail panel
- **THEN** the system updates the selected node and reflects changes in both card view and detail view

### Requirement: Status visualization is deterministic
The system SHALL render node border color from a fixed status mapping and SHALL display a legend that documents the mapping.

#### Scenario: Render status legend
- **WHEN** the workspace loads
- **THEN** the system shows a legend that maps each allowed status to exactly one color

#### Scenario: Reject unknown status
- **WHEN** a node update attempts to set a status outside the allowed enum
- **THEN** the system rejects the update and keeps the previous valid status
