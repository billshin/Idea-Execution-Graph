## Context

The current graph editor supports creating connected nodes and edges, but it does not provide explicit directional expansion controls (above/below) and edge styling is not configurable. Edge color semantics are currently detached from downstream node status, which reduces visual clarity when reviewing execution paths. The implementation is in a React + TypeScript app using Zustand for state and React Flow for graph rendering.

## Goals / Non-Goals

**Goals:**
- Add deterministic node expansion actions for creating a connected node above or below the current node.
- Add edge style metadata and rendering controls with default solid style.
- Apply edge color based on the connected target node status color by default.
- Keep backward compatibility for old snapshots through default edge style migration.

**Non-Goals:**
- No user/account or permission model changes.
- No real-time collaboration changes.
- No backend/API work in this change.

## Decisions

1. Introduce edge presentation metadata on each edge record.
- Decision: Add `data.styleType` and `data.arrow` style metadata to `IdeaEdge` shape (or equivalent React Flow edge data), while retaining existing id/source/target.
- Rationale: Keeps style behavior persisted and explicit without requiring global style state.
- Alternative considered: Infer style from temporary UI mode only. Rejected because it cannot survive reload/export.

2. Use target node status as default edge color source.
- Decision: Derive edge stroke color from `edge.target` node status color map unless user later overrides (future extension).
- Rationale: Aligns link semantics with the destination work state and matches the requested behavior.
- Alternative considered: Source node status or neutral edge color. Rejected due to weaker downstream meaning.

3. Add dedicated actions for top/bottom connected node creation.
- Decision: Implement new store actions that create a child node with positional offsets above (`y - offset`) or below (`y + offset`) and connect from current node.
- Rationale: Explicit directional expansion reduces manual drag/reposition work.
- Alternative considered: Reusing generic addConnectedNode with post-adjust drag. Rejected as less efficient.

4. Migration strategy for existing edge data.
- Decision: On snapshot load, normalize missing edge style fields to `{ styleType: "solid", arrow: "none" }`.
- Rationale: Prevents runtime branching and ensures stable rendering for old exports.

## Risks / Trade-offs

- [Risk] Additional edge metadata may break assumptions in existing export/import validation. -> Mitigation: Extend validation with optional defaults and load-time normalization.
- [Risk] Automatic status color updates can cause frequent rerenders when node statuses change. -> Mitigation: Compute edge styles in memoized selectors and update only affected edges.
- [Risk] Directional placement may overlap in dense graphs. -> Mitigation: Apply small incremental offsets based on existing linked child count in each direction.

## Migration Plan

1. Update types for edge style metadata and normalize during load.
2. Add new store actions for top/bottom node insertion.
3. Add node UI controls to trigger directional insertion.
4. Add edge style editor controls (solid/dashed/arrow variants) and persist changes.
5. Update edge rendering logic to apply style + target-status color.
6. Verify old snapshots load with default solid style.
7. Build and manual regression test (create/edit/save/load/export/import).

Rollback strategy:
- Revert type/store/UI changes in one release if rendering or persistence regressions appear; old snapshots remain usable due to fallback defaults.

## Open Questions

- Should arrow style options be represented as line-end marker variants (`none`, `arrow`) or include bidirectional arrows in this phase?
- Should users be allowed to manually override color after default status color assignment in phase 1, or defer to a follow-up change?
