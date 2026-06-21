## MODIFIED Requirements

### Requirement: Users can create and connect idea nodes
The system SHALL allow users to create nodes from the canvas or from an existing node, SHALL allow users to create directed edges between node connection points, and SHALL allow users to delete nodes and link lines.

#### Scenario: Create node from blank area
- **WHEN** the user triggers add-node on an empty canvas area
- **THEN** the system creates a new node with default title `START`, status `open`, and a stable unique id

#### Scenario: Connect two nodes
- **WHEN** the user drags a connector from one node endpoint to another compatible endpoint
- **THEN** the system creates a directed edge with unique id and persists source/target references to existing node ids

#### Scenario: Delete link line
- **WHEN** the user triggers delete on a selected edge
- **THEN** the system removes that edge from graph state

#### Scenario: Delete node
- **WHEN** the user triggers delete on a selected node
- **THEN** the system removes the node and all incident edges from graph state

### Requirement: Users can edit core node details
The system SHALL provide inline editing for card-visible node fields, SHALL provide a double-click modal for full node detail editing, and SHALL allow users to change node status through a dropdown on the node card.

#### Scenario: Inline edit title
- **WHEN** the user edits the visible node title directly on the node card and confirms input
- **THEN** the system updates node title in graph state without opening a side panel

#### Scenario: Open modal on double-click
- **WHEN** the user double-clicks a node
- **THEN** the system opens node detail modal prefilled with the selected node values

#### Scenario: Change status from node card
- **WHEN** the user selects a new status from the node card dropdown
- **THEN** the system updates node status and re-renders status color immediately

### Requirement: Status visualization is deterministic
The system SHALL render node border color from a fixed status mapping and SHALL display a legend that documents the mapping.

#### Scenario: Render status legend
- **WHEN** the workspace loads
- **THEN** the system shows a legend that maps each allowed status to exactly one color

#### Scenario: Reject unknown status
- **WHEN** a node update attempts to set a status outside the allowed enum
- **THEN** the system rejects the update and keeps the previous valid status
