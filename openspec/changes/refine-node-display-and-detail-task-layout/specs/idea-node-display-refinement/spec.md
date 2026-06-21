## ADDED Requirements

### Requirement: Start and branch node defaults SHALL match workflow presets
The system SHALL initialize the root start node with title `New Idea`, subtitle `開始建立新想法`, and label `Start`.

#### Scenario: Start node bootstraps with updated defaults
- **WHEN** a new workspace is initialized from default graph data
- **THEN** the first node uses title `New Idea`, subtitle `開始建立新想法`, and includes label `Start`

### Requirement: Plus-created branch nodes SHALL use dedicated branch defaults
Nodes created from the inline `+` action SHALL use title `解決方式`, subtitle `使用什麼方法來解決這個問題?`, and label `thinking`.

#### Scenario: Inline plus creates branch node with expected content
- **WHEN** a user clicks the inline `+` button on a node
- **THEN** the new connected node uses title `解決方式`, subtitle `使用什麼方法來解決這個問題?`, and includes label `thinking`

### Requirement: Optional node fields SHALL be hidden when empty
When optional node fields are empty after trimming, the node card SHALL not render those rows even if display toggles are enabled. Title and subtitle are excluded from this hiding rule.

#### Scenario: Empty conclusion is not rendered
- **WHEN** conclusion is empty or whitespace and conclusion display is enabled
- **THEN** the node card does not render a conclusion row

#### Scenario: Empty task list is not rendered
- **WHEN** task list display is enabled and the node has no tasks
- **THEN** the node card does not render the mini task list block

### Requirement: Target date SHALL render below conclusion when both are visible
The node card SHALL place target date beneath conclusion in the vertical content order.

#### Scenario: Conclusion and target date order
- **WHEN** both conclusion and target date are non-empty and enabled
- **THEN** conclusion is rendered first and target date is rendered immediately below it

### Requirement: Completed mini tasks SHALL use green leading indicator
Task items marked complete SHALL show a green leading list indicator in the node mini task list.

#### Scenario: Completed task visual cue
- **WHEN** a mini task has `done=true`
- **THEN** the task row leading indicator color is green
