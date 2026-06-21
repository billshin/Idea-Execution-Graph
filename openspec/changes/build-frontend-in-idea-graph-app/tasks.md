## 1. Project Setup and Dependencies

- [x] 1.1 Confirm idea-graph-app uses React + TypeScript and installs reactflow and zustand
- [x] 1.2 Add markdown support dependency and shared type definitions for node, edge, task, and UI models
- [x] 1.3 Create folder structure for store, graph components, workspace controls, persistence, and constants

## 2. Domain Model and State Store

- [x] 2.1 Implement fixed status enum and color legend mapping constants
- [x] 2.2 Implement Zustand store slices for graph data (nodes, edges), workspace controls, and task parking lot
- [x] 2.3 Add store actions for create/update node, connect/remove edge, and safe status updates with enum validation

## 3. Graph Editor Implementation

- [x] 3.1 Integrate React Flow canvas and wire node/edge state from the store
- [x] 3.2 Implement node creation from blank canvas and from existing node actions with default START/open values
- [x] 3.3 Implement node detail editing panel for title, subtitle, target date, conclusion, content, labels, and status
- [x] 3.4 Implement status legend UI and verify node border colors render deterministically by status

## 4. Workspace Controls and Interaction Modes

- [x] 4.1 Build control panel UI for focus mode, finish mode, display toggles, and edge transparency levels
- [x] 4.2 Implement graph filtering logic for is_focus_path routes and finish-ending routes
- [x] 4.3 Implement global and per-node collapse/expand behavior with aggregated descendant task counts
- [x] 4.4 Implement Task Parking Lot panel with add/edit/remove items and conversion into node task entries

## 5. Local Persistence and Recovery

- [x] 5.1 Implement persistence service to save `{schemaVersion, graph, ui}` to a dedicated LocalStorage key
- [x] 5.2 Implement hydration logic on app load with payload parsing and shape validation
- [x] 5.3 Add fallback behavior for unknown schema versions and corrupted payloads without app crash
- [x] 5.4 Ensure file references are persisted as metadata only (id, name, url) and never as binary content

## 6. Verification and Acceptance

- [x] 6.1 Validate all scenarios in specs/idea-graph-editor/spec.md against implemented behavior
- [x] 6.2 Validate all scenarios in specs/idea-graph-workspace-controls/spec.md against implemented behavior
- [x] 6.3 Validate all scenarios in specs/idea-graph-local-persistence/spec.md against implemented behavior
- [x] 6.4 Run npm run build and fix any TypeScript or lint errors introduced by this change
