## Context

The initial Idea Graph frontend is implemented and functional, but key daily operations are inefficient: users must edit from a persistent side panel, control placement is inconsistent, and mistakes cannot be quickly reverted. The next iteration focuses on direct manipulation patterns (inline edit, modal edit on double-click, fast actions on node header) while preserving current graph and persistence architecture.

Constraints:
- Frontend-only update in idea-graph-app.
- Existing React Flow + Zustand architecture should remain the core.
- LocalStorage remains the source of persisted state.
- Changes must keep interactions testable and keyboard-safe.

## Goals / Non-Goals

**Goals:**
- Support deletion of both nodes and link lines.
- Add Ctrl+Z undo for recent graph/edit operations.
- Replace always-visible right detail panel with double-click node edit modal.
- Move Task Parking Lot to the left side and reduce right-side clutter.
- Enable inline editing for visible node text and direct status dropdown change.
- Normalize node top-right action order: Collapse/Expand, Status, +.
- Extend Custom Display with task list visibility toggle.

**Non-Goals:**
- No backend or multi-user collaboration changes.
- No full redo stack beyond required undo in this iteration.
- No redesign of status taxonomy or persistence storage format version unless needed for compatibility.

## Decisions

1. Command-style history in store
- Decision: Add a bounded undo stack in Zustand snapshots for node/edge mutations and editable field commits.
- Rationale: Most requested recovery flow is immediate undo of recent edits/deletes.
- Alternatives considered:
  - Browser-native undo: inconsistent for canvas operations.
  - Full event sourcing: too heavy for this scope.

2. Node edit modal as primary deep editor
- Decision: Open node detail modal on double-click; remove persistent right detail panel.
- Rationale: Keeps workspace focused while preserving full edit capability.
- Alternatives considered:
  - Keep side panel and add modal: duplicates editing surfaces.

3. Inline quick-edit for card-visible fields
- Decision: Visible text fields (title/subtitle/conclusion/task preview where displayed) become directly editable on node card.
- Rationale: Common edits should not require opening modal.
- Alternatives considered:
  - Modal-only editing: slower for frequent micro-edits.

4. Unified node action bar
- Decision: Place collapse toggle, status dropdown, and add-node button in node top-right with fixed order.
- Rationale: Improves discoverability and prevents control scattering.
- Alternatives considered:
  - Mixed placement around node body: causes cognitive load.

5. Layout rebalance
- Decision: Move Task Parking Lot to left area with workspace controls; free right side for modal-only interactions.
- Rationale: parking lot is planning/navigation support, not node-specific detail.

## Risks / Trade-offs

- [Risk] Undo snapshots may increase memory usage with large graphs. -> Mitigation: cap history length and snapshot only necessary state slices.
- [Risk] Double-click edit may conflict with drag/select interactions. -> Mitigation: debounce click handling and ignore drag-origin events.
- [Risk] Inline editing can accidentally trigger graph selection/drag behavior. -> Mitigation: stop propagation on edit controls and provide explicit edit mode styling.
- [Risk] Deleting nodes with connected edges may surprise users. -> Mitigation: show confirmation and include operation in undo history.

## Migration Plan

1. Add undo stack and keyboard handler (Ctrl+Z) in store/app shell.
2. Add node/edge delete actions and connect them to UI controls/context actions.
3. Implement node edit modal and remove always-on right detail panel.
4. Add inline editable node fields and top-right unified action row.
5. Move Task Parking Lot to left column and update Custom Display options with task list toggle.
6. Validate keyboard/mouse interaction conflicts and persistence compatibility.

Rollback strategy:
- If regressions appear, disable new inline/modal paths via feature flag branch and restore prior panel flow while keeping non-breaking store changes isolated.

## Open Questions

- Should Ctrl+Z be global for the whole canvas only, or also active while typing in inline fields/modal inputs?
- For node deletion, should confirmation be mandatory or bypassed when undo is available?
- Should task list inline edit support full CRUD from card, or only visibility + quick status toggles in this change?
