## Why

The previous node editing refinement improved direct manipulation, but the current inline editing model is still too eager and the node action layout remains visually busy. A more deliberate edit mode, plus a hidden utility tray for low-frequency actions, will reduce accidental edits and make node cards feel closer to the intended planning workflow.

## What Changes

- Add a left-side `edit lock` toggle that disables inline editing behavior while locked.
- Change inline text editing so node text enters edit mode only after an explicit click on that field.
- Save inline edits on `Enter` or when focus leaves the field.
- Refine add-node affordance so the `+` sits on the right side in an n8n-like pattern.
- Add a hidden node utility tray at the bottom of the card.
- Add a gear button beside status that reveals the utility tray.
- Move `Collapse/Expand` into the utility tray instead of keeping it in the always-visible header action row.
- Reduce utility tray button text size to make the tray secondary to core node content.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `idea-graph-editor`: Change inline editing activation/commit flow, add edit-lock behavior, add gear-triggered utility tray, and reposition add-node/collapse interactions.
- `idea-graph-workspace-controls`: Add a left-side edit-lock toggle that affects node editability.

## Impact

- Affected code: node card rendering, node-local interaction state, workspace controls, and store-level edit gating in idea-graph-app.
- Dependencies: no new external dependency expected; can build on existing React + Zustand implementation.
- UX impact: lowers accidental edits, reduces visible action noise, and creates a clearer distinction between primary content and secondary actions.
