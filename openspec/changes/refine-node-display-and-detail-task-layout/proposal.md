## Why

The node card and Node Detail editing experience is visually inconsistent and slows down daily workflow. Refining defaults, field visibility, and task-row layout now improves clarity and reduces repetitive editing friction when building idea graphs.

## What Changes

- Update default content for the start node and for nodes created from the inline `+` action.
- Refine node-card rendering behavior: subtitle visual tone, target date placement, and hide empty non-core fields.
- Improve node task-list visual feedback by marking completed task rows with a green leading indicator.
- Redesign Node Detail layout so Markdown editing has a larger right-side workspace.
- Extend task data entry in Node Detail with a `conclusion` field and align task display into a single-row checklist format.
- Standardize checklist row structure to: checkbox, title, required, conclusion.

## Capabilities

### New Capabilities
- `idea-node-display-refinement`: Node card display defaults, field-visibility rules, and task completion visual styling.
- `node-detail-task-layout-refinement`: Node Detail panel layout redesign and single-row task editing/presentation enhancements.

### Modified Capabilities
- None.

## Impact

- Affected UI components: node card and Node Detail panel rendering/interaction.
- Affected style layer: node card and panel CSS layout and task-row styles.
- Affected state updates: default node payload values and task item editing payload shape.
- No backend/API dependency changes.
