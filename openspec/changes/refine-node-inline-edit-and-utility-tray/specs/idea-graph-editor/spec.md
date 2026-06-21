## MODIFIED Requirements

### Requirement: Users can create and connect idea nodes
The system SHALL allow users to create nodes from the canvas or from an existing node, SHALL allow users to create directed edges between node connection points, SHALL allow users to delete nodes and link lines, and SHALL present the add-node affordance as a right-side `+` action aligned with flow direction.

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
The system SHALL provide click-to-enter inline editing for card-visible node fields, SHALL save inline edits on Enter or blur, SHALL provide a double-click modal for full node detail editing, and SHALL allow users to change node status through a dropdown on the node card.

#### Scenario: Enter inline edit mode
- **WHEN** the user clicks a card-visible text field while edit lock is off
- **THEN** the system switches that field into editable input mode and focuses it

#### Scenario: Save inline edit on Enter
- **WHEN** the user presses Enter while editing a card-visible field
- **THEN** the system commits the new value and returns the field to display mode

#### Scenario: Save inline edit on blur
- **WHEN** the user clicks outside an active card-visible field after editing it
- **THEN** the system commits the new value and returns the field to display mode

#### Scenario: Open modal on double-click
- **WHEN** the user double-clicks a node
- **THEN** the system opens node detail modal prefilled with the selected node values

#### Scenario: Change status from node card
- **WHEN** the user selects a new status from the node card dropdown
- **THEN** the system updates node status and re-renders status color immediately

### Requirement: Node secondary actions are hidden by default
The system SHALL keep secondary node actions in a hidden bottom utility tray, and SHALL reveal that tray only when the user activates the gear control beside node status.

#### Scenario: Open utility tray
- **WHEN** the user activates the gear control on a node
- **THEN** the system reveals the bottom utility tray for that node

#### Scenario: Collapse control in utility tray
- **WHEN** the user opens the utility tray
- **THEN** the system exposes Collapse/Expand inside the tray instead of the always-visible header action row

### Requirement: Status visualization is deterministic
The system SHALL render node border color from a fixed status mapping and SHALL display a legend that documents the mapping.

#### Scenario: Render status legend
- **WHEN** the workspace loads
- **THEN** the system shows a legend that maps each allowed status to exactly one color

#### Scenario: Reject unknown status
- **WHEN** a node update attempts to set a status outside the allowed enum
- **THEN** the system rejects the update and keeps the previous valid status
