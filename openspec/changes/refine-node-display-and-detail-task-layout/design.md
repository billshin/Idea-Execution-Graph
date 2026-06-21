## Context

The current node card and Node Detail UI have grown through multiple incremental tweaks, resulting in mixed visual rules and inconsistent edit ergonomics. Users need tighter defaults, less noise from empty fields, and a denser task-editing layout in Node Detail. The codebase already centralizes most behavior in `IdeaNodeCard`, `NodeDetailPanel`, `NodeEditModal`, `graphStore`, and shared stylesheet blocks, so the change can stay front-end only.

## Goals / Non-Goals

**Goals:**
- Align start-node and `+`-created-node defaults with current workflow language.
- Make node-card rendering rules explicit: keep title/subtitle visible, hide empty optional fields.
- Improve scan-ability by positioning target date under conclusion and adding completion color cues for task rows.
- Redesign Node Detail to give Markdown editing a larger right-side editing area.
- Extend task rows in Node Detail with `conclusion`, and render each task in one horizontal row: checkbox, title, required, conclusion.

**Non-Goals:**
- No backend, API, or persistence-format migrations.
- No changes to graph edge behavior, drag behavior, or modal routing model.
- No refactor of unrelated panels (workspace controls, parking lot workflows).

## Decisions

### 1) Keep defaults in existing state creation points
- Update start-node defaults in `constants/defaults`.
- Update `+` branch defaults only in `addConnectedNode` in `graphStore`.
- Rationale: the user explicitly wants `+` behavior only; this avoids changing other node creation paths.
- Alternative considered: central default-node factory used everywhere. Rejected to avoid broad behavior drift.

### 2) Enforce optional-field visibility at render gates
- Keep title/subtitle always renderable when enabled.
- Gate optional sections (`conclusion`, `targetDate`, task list) on both display toggle and non-empty content.
- Rationale: avoids placeholder clutter while preserving intentional core fields.
- Alternative considered: CSS-based empty-state hiding. Rejected because JSX gating is clearer and testable.

### 3) Completion color cue via task-row class state
- Apply a completed class for done tasks; style leading indicator green.
- Rationale: minimal, glanceable progress signal without changing task semantics.
- Alternative considered: full-row green background. Rejected due visual noise in dense nodes.

### 4) Node Detail layout split with right-side Markdown editor
- Convert Node Detail content area to two columns: left for metadata/tasks, right for Markdown edit + preview context.
- Rationale: gives content authoring the largest practical area while preserving task controls.
- Alternative considered: tabs (Details/Markdown). Rejected because users need simultaneous reference.

### 5) Expand task schema usage in UI with `conclusion` column
- Add task conclusion input/edit support in Node Detail task section.
- Render each task as a single-row checklist layout: checkbox | title | required | conclusion.
- Rationale: supports concise progress notes per task and improves row scanning.
- Alternative considered: stacked mobile-like blocks. Rejected for desktop-first editing throughput.

## Risks / Trade-offs

- [Risk] Single-row task layout can become cramped on narrow widths. → Mitigation: allow row wrapping at small breakpoints while preserving column order.
- [Risk] Hiding empty optional fields may make edit affordance less discoverable. → Mitigation: keep edits accessible in Node Detail and modal.
- [Risk] Adding task conclusion may require guard handling in existing task rendering paths. → Mitigation: default missing conclusion to empty string in UI mapping.

## Migration Plan

1. Update defaults and node-card rendering logic.
2. Apply task completion visual cue styles.
3. Implement Node Detail split layout and task row schema/UI updates.
4. Verify create/edit flows for start node, `+` node, and existing saved nodes.
5. Rollback strategy: revert UI/state changes in touched components; no data migration rollback needed.

## Open Questions

- Should task `conclusion` be shown in condensed node task mini-list, or only in Node Detail?
- On very narrow screens, should Node Detail switch to stacked sections automatically at a specific breakpoint?
