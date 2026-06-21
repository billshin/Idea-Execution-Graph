## Context

The project has a product proposal for an idea-driven graph workflow and an initialized React application at idea-graph-app, but no implemented feature set yet. The MVP must validate core user flows (create node, connect node, organize tasks, and recover workspace state) without introducing backend services.

Constraints:
- Frontend only for MVP (React + TypeScript).
- State management with Zustand.
- Graph visualization with React Flow.
- Persistence limited to LocalStorage.
- File uploads are represented as metadata/links only in MVP.

## Goals / Non-Goals

**Goals:**
- Deliver a usable graph editor MVP in idea-graph-app.
- Provide predictable status visualization and workspace filtering controls.
- Support collapse/expand behavior and a Task Parking Lot for unsorted work items.
- Persist nodes, edges, and UI settings across browser reloads.
- Keep domain model explicit so future backend migration is straightforward.

**Non-Goals:**
- No backend API, auth, or multi-user collaboration.
- No binary file storage pipeline in MVP.
- No cross-device synchronization.
- No advanced analytics or automation workflows.

## Decisions

1. Single source of truth in a Zustand store
- Decision: Maintain graph domain state (nodes, edges, tasks, workspace modes) in one typed Zustand store, with selectors for UI components.
- Rationale: Reduces prop drilling and keeps React Flow integration deterministic.
- Alternatives considered:
  - React Context + reducers: viable but more boilerplate and harder slice composition.
  - Redux Toolkit: powerful but heavier than required for MVP.

2. React Flow as graph interaction layer
- Decision: Use React Flow for rendering nodes/edges, drag-drop, and connection events.
- Rationale: Mature ecosystem and direct fit for graph editing requirements.
- Alternatives considered:
  - Custom SVG/canvas implementation: too expensive for MVP timeline.
  - Cytoscape.js: stronger for analysis than editing-first UI.

3. Normalized persistence boundary
- Decision: Persist a versioned payload `{schemaVersion, graph, ui}` to LocalStorage via a dedicated persistence service.
- Rationale: Allows future migrations and controlled error handling for stale payloads.
- Alternatives considered:
  - Direct component-level LocalStorage writes: causes duplication and inconsistent state.
  - IndexedDB now: unnecessary complexity for MVP.

4. Status model with fixed enum + extensible labels
- Decision: Enforce a fixed status enum (`open`, `doing`, `wait`, `hold`, `finish`, `fail`, `cancel`) while allowing free-form labels.
- Rationale: UI filtering and color legends require deterministic status values; labels remain flexible.
- Alternatives considered:
  - Fully free-form status strings: breaks filters and legend consistency.

5. Task Parking Lot as first-class workspace collection
- Decision: Model parking-lot tasks as their own collection in store, with optional conversion into node tasks.
- Rationale: Prevents overloading node schema and keeps unsorted work discoverable.
- Alternatives considered:
  - Store parking-lot items as hidden nodes: increases graph noise and implementation coupling.

## Risks / Trade-offs

- [Risk] LocalStorage capacity can be exceeded for large markdown/file metadata payloads. -> Mitigation: keep payload compact, store only file metadata/links, add size guard with user-facing warning.
- [Risk] Ambiguity between status and labels can reappear in UI copy. -> Mitigation: define status enum in shared types and validate inputs at update boundaries.
- [Risk] Complex filters (focus/finish/display) can hurt performance on dense graphs. -> Mitigation: memoized selectors and incremental filtering before render.
- [Risk] Collapse behavior may conflict with manual node positions. -> Mitigation: preserve positions and represent collapsed child counts separately.

## Migration Plan

1. Implement typed domain models and Zustand store slices in idea-graph-app.
2. Integrate React Flow canvas with node/edge CRUD handlers.
3. Add workspace control panel (focus/finish/display toggles, collapse controls).
4. Add Task Parking Lot panel and conversion action to node tasks.
5. Add persistence service with load/save and schemaVersion checks.
6. Validate against acceptance scenarios and prepare for `/opsx:apply` implementation tasks.

Rollback strategy:
- If a release build fails functionally, revert to previous frontend commit and clear only the feature-specific LocalStorage key to avoid stale schema conflicts.

## Open Questions

- Should finish mode include only paths ending in `finish`, or also include intermediary nodes on all qualifying paths?
- Should node markdown support image paste as base64 in MVP, or only external URL references?
- What is the maximum recommended node/task count before warning users about LocalStorage limits?
