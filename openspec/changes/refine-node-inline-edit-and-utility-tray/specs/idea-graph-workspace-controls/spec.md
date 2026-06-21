## MODIFIED Requirements

### Requirement: Workspace supports display field toggles and edge transparency
The system SHALL let users toggle visibility of card display fields, SHALL provide selectable edge transparency levels (`high`, `medium`, `low`), SHALL include task list visibility in custom display toggles, and SHALL provide an edit-lock control that gates inline node editing behavior.

#### Scenario: Hide subtitle field
- **WHEN** the user disables subtitle in custom display settings
- **THEN** node cards no longer render subtitle while other enabled fields remain visible

#### Scenario: Set edge transparency
- **WHEN** the user selects `medium` edge transparency
- **THEN** all visible edges are rendered with the opacity value mapped to `medium`

#### Scenario: Hide task list field
- **WHEN** the user disables task list in custom display settings
- **THEN** task list content is not rendered on node cards

#### Scenario: Enable edit lock
- **WHEN** the user turns on edit lock in the left-side workspace controls
- **THEN** inline node text fields do not enter edit mode when clicked

### Requirement: Workspace supports collapse and task parking lot workflows
The system SHALL support global and per-node collapse actions, SHALL position task parking lot in the left-side workspace support area, and SHALL provide a task parking lot area for unsorted task/text items.

#### Scenario: Collapse a node branch
- **WHEN** the user uses Collapse/Expand from the node utility tray
- **THEN** descendant task list details are hidden and an aggregated task count is shown on the parent card

#### Scenario: Add parking lot item
- **WHEN** the user adds a task or text item to the parking lot
- **THEN** the item appears in the left-side parking lot panel and remains available for later assignment
