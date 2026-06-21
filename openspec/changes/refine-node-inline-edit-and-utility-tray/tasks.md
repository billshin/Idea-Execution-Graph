## 1. Workspace Edit Gating

- [x] 1.1 Add edit-lock state to workspace controls and store
- [x] 1.2 Define which node interactions are blocked by edit lock and wire the guard into inline edit entry points
- [x] 1.3 Ensure edit lock UI clearly reflects locked vs unlocked state

## 2. Inline Edit Activation Flow

- [x] 2.1 Replace always-on inline inputs with display-first text fields on node cards
- [x] 2.2 Implement click-to-enter edit mode for visible node text fields
- [x] 2.3 Implement save-on-Enter and save-on-blur behavior for active inline edits
- [x] 2.4 Verify inline editing does not conflict with node selection or drag interactions

## 3. Node Action Layout Refinement

- [x] 3.1 Rework node header so status and gear stay visible while secondary actions remain hidden
- [x] 3.2 Add gear-triggered bottom utility tray per node
- [x] 3.3 Move Collapse/Expand from the always-visible header into the utility tray
- [x] 3.4 Re-style utility tray buttons with smaller visual weight
- [x] 3.5 Adjust add-node affordance to a right-side n8n-like `+` placement

## 4. Verification

- [x] 4.1 Verify edit lock prevents inline edit entry while preserving selection and modal editing
- [x] 4.2 Verify utility tray open/close behavior and collapse workflow remain predictable
- [x] 4.3 Verify status dropdown and add-node affordance still behave correctly after layout changes
- [x] 4.4 Run npm run build and fix any TypeScript or lint errors introduced by this change
