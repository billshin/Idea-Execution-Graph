## Why

The project already has a clear product concept in the design draft, but there is no implemented frontend that validates the workflow end to end. Building a runnable MVP now reduces ambiguity and allows rapid iteration on node behavior, status flow, and storage constraints.

## What Changes

- Create a React + TypeScript frontend in idea-graph-app as the implementation target for the concept.
- Implement a graph workspace where users can create, connect, and manage idea nodes.
- Add core node fields and status visualization with a consistent color legend.
- Add view controls for focus mode, finish mode, and display-field toggles.
- Implement node collapse/expand and a Task Parking Lot area.
- Persist graph and UI state in LocalStorage for MVP scope.

## Capabilities

### New Capabilities
- `idea-graph-editor`: Interactive idea graph editing with node creation, edge linking, node detail editing, and status-based visualization.
- `idea-graph-workspace-controls`: Workspace-level controls including focus/finish filters, display toggles, collapse behaviors, and task parking lot interactions.
- `idea-graph-local-persistence`: LocalStorage-based save/load of graph data and UI settings for MVP.

### Modified Capabilities
- None.

## Impact

- Affected code: frontend React app under idea-graph-app (components, state store, graph rendering, persistence utilities).
- Dependencies: reactflow, zustand, markdown rendering/editor package(s).
- APIs/systems: no backend API in MVP; browser LocalStorage is the persistence layer.
- Risks: LocalStorage size and file-upload scope must remain constrained to metadata/links in MVP.
