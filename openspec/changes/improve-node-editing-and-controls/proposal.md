## Why

The first frontend implementation proved the core graph flow, but editing and control interactions still create friction for daily use. Improving node editing entry points, action placement consistency, and recoverability now will make the graph usable for iterative planning instead of one-off demos.

## What Changes

- Add deletion support for both nodes and link lines.
- Add undo behavior with Ctrl+Z for recent operations.
- Remove persistent right-side Node Detail panel and switch to a node double-click edit modal.
- Move Task Parking Lot from right panel to left panel.
- Improve node interaction: inline-edit visible text fields and change status from a dropdown directly on node.
- Align node top-right controls to one row with order: Collapse/Expand, Status, +.
- Update Custom Display controls to include task list visibility.

## Capabilities

### New Capabilities
- `graph-edit-history`: Undo support for graph operations and field edits with keyboard shortcut integration.

### Modified Capabilities
- `idea-graph-editor`: Add node/edge deletion, inline node editing, modal edit workflow, and top-right node action layout updates.
- `idea-graph-workspace-controls`: Move parking lot placement and add task-list toggle in custom display controls.

## Impact

- Affected code: idea-graph-app graph node component, app layout, editing flows, and Zustand store actions.
- Dependencies: may require lightweight hotkey/history helper; keep existing stack where possible.
- APIs/systems: frontend-only; LocalStorage persistence must include history-safe current snapshot behavior.
- UX impact: reduces panel clutter and makes node operations faster through direct manipulation.
