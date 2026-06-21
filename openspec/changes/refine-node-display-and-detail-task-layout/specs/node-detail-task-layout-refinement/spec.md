## ADDED Requirements

### Requirement: Node Detail SHALL provide right-side Markdown editing workspace
The Node Detail view SHALL allocate a larger right-side editing region for Markdown content relative to metadata controls.

#### Scenario: Node Detail layout split
- **WHEN** a node is opened in Node Detail
- **THEN** metadata and task controls appear in a left region and Markdown editing appears in a larger right region

### Requirement: Node Detail tasks SHALL support conclusion field
Each task in Node Detail SHALL support editing and displaying a `conclusion` value.

#### Scenario: Add task with conclusion
- **WHEN** a user creates a task from Node Detail and fills title, required, and conclusion
- **THEN** the new task stores all three text fields and displays them in the task list

### Requirement: Task checklist rows SHALL render in single-line column order
Node Detail SHALL render each task row in one horizontal line using this order: checkbox, title, required, conclusion.

#### Scenario: Existing tasks render in fixed order
- **WHEN** Node Detail renders saved tasks
- **THEN** each task row shows checkbox at far left followed by title, required, and conclusion columns

### Requirement: Modal node editor SHALL close on Escape
The node modal editor SHALL close when the user presses the Escape key.

#### Scenario: Escape closes modal
- **WHEN** NodeEdit modal is open and user presses Escape
- **THEN** the modal closes without requiring mouse interaction
