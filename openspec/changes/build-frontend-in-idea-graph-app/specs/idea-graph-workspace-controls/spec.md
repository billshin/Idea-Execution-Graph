## ADDED Requirements

### Requirement: Workspace supports focus and finish modes
The system SHALL provide a focus mode that displays only paths marked as focus paths, and SHALL provide a finish mode that displays only paths ending in finish-status nodes.

#### Scenario: Enable focus mode
- **WHEN** the user enables focus mode
- **THEN** the system renders only nodes and edges that belong to `is_focus_path` routes

#### Scenario: Enable finish mode
- **WHEN** the user enables finish mode
- **THEN** the system renders only nodes and edges on routes that terminate at nodes with status `finish`

### Requirement: Workspace supports display field toggles and edge transparency
The system SHALL let users toggle visibility of card display fields and SHALL provide selectable edge transparency levels (`high`, `medium`, `low`).

#### Scenario: Hide subtitle field
- **WHEN** the user disables subtitle in custom display settings
- **THEN** node cards no longer render subtitle while other enabled fields remain visible

#### Scenario: Set edge transparency
- **WHEN** the user selects `medium` edge transparency
- **THEN** all visible edges are rendered with the opacity value mapped to `medium`

### Requirement: Workspace supports collapse and task parking lot workflows
The system SHALL support global and per-node collapse actions, and SHALL provide a task parking lot area for unsorted task/text items.

#### Scenario: Collapse a node branch
- **WHEN** the user collapses a parent node
- **THEN** descendant task list details are hidden and an aggregated task count is shown on the parent card

#### Scenario: Add parking lot item
- **WHEN** the user adds a task or text item to the parking lot
- **THEN** the item appears in the parking lot panel and remains available for later assignment
