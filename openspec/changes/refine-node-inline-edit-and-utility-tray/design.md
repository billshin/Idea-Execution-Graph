## Context

The prior node editing refinement introduced inline editing, modal editing, and simplified action placement, but the current interaction still exposes editing too aggressively. This next refinement narrows edit activation, adds an explicit edit lock, and moves low-frequency actions into a hidden utility tray so the node surface remains focused on content.

Current context:
- The frontend is already using React Flow + Zustand.
- Inline edits currently happen immediately on visible inputs.
- Header controls are always visible and currently include collapse/status/add interactions.
- The left panel already contains workspace controls and parking lot.

## Goals / Non-Goals

**Goals:**
- Add a workspace-level edit lock toggle that disables inline node editing while active.
- Require an explicit click to enter inline editing mode for node text fields.
- Commit inline edits on Enter or blur.
- Make the add-node `+` feel more like an n8n-style right-edge affordance.
- Introduce a hidden bottom utility tray revealed by a gear icon near status.
- Move Collapse/Expand into that utility tray.
- Reduce utility tray button prominence with smaller button text.

**Non-Goals:**
- No new backend or persistence model changes.
- No change to the node edit modal as the full-detail editor.
- No redesign of graph filtering, undo architecture, or status taxonomy.

## Decisions

1. Edit lock gates inline editing only
- Decision: `edit lock` disables click-to-edit text entry and related inline commit paths, while leaving selection, modal opening, and navigation intact.
- Rationale: The user intent is to prevent accidental inline edits, not freeze the whole graph.
- Alternatives considered:
  - Global hard lock for all node actions: too restrictive for planning flow.

2. Inline text enters explicit edit mode
- Decision: Card-visible text renders as display text until clicked, then switches to a focused editable input for that field only.
- Rationale: Prevents every node from visually looking editable all the time and reduces accidental text mutation.
- Alternatives considered:
  - Always-on inputs: too noisy and easy to mis-edit.

3. Utility tray for secondary actions
- Decision: Add a gear toggle beside status that reveals a bottom utility tray containing Collapse/Expand and future secondary actions.
- Rationale: Keeps the primary node header compact while preserving access to lower-frequency controls.
- Alternatives considered:
  - Keep collapse in header: continues to overload the top action row.

4. Right-edge add affordance
- Decision: Keep the add-node action visually anchored to the right side of the node, closer to n8n's mental model.
- Rationale: Reinforces flow direction and makes branch growth easier to discover.

## Risks / Trade-offs

- [Risk] Click-to-edit may conflict with node selection and drag behavior. -> Mitigation: use field-level click handlers that stop propagation and only enter edit mode on dedicated content targets.
- [Risk] Edit lock semantics may confuse users if modal editing still works. -> Mitigation: document lock scope in UI copy or tooltip as "locks inline edit".
- [Risk] Hidden utility tray can reduce discoverability of collapse behavior. -> Mitigation: make gear icon clear and keep status/gear cluster visually grouped.
- [Risk] Blur-to-save can commit accidental edits. -> Mitigation: preserve Enter commit and ensure lock prevents unintended edit entry in the first place.

## Migration Plan

1. Add workspace-level edit-lock state to controls/store.
2. Replace always-on inline inputs with display-first, click-to-edit field components.
3. Add commit-on-Enter and commit-on-blur handling.
4. Move collapse control into a hidden utility tray revealed by a gear button.
5. Re-style add-node affordance to align with right-edge action pattern.
6. Verify edit lock, click-to-edit, blur/Enter commit, and tray interactions do not conflict with selection/drag.

Rollback strategy:
- If the explicit edit mode causes too much friction, revert card-visible fields back to prior always-on input behavior while retaining modal edit and utility tray changes separately.

## Open Questions

- Should `edit lock` also block status dropdown changes, or only text field entry?
- Should utility tray remain open per node until manually closed, or auto-close on blur/selection change?
- Should the right-edge `+` be embedded inside the card header, or visually attached just outside the node border?
