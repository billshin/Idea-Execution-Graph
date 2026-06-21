## 1. Store and Interaction Foundations

- [x] 1.1 Add node and edge delete actions in graph store with consistent cleanup rules
- [x] 1.2 Add bounded undo history snapshots in store for graph mutations and committed field edits
- [x] 1.3 Add Ctrl+Z keyboard handler in app shell and route it to undo action

## 2. Node Editing UX Refactor

- [x] 2.1 Remove persistent right-side Node Detail panel from layout
- [x] 2.2 Implement node double-click behavior to open node edit modal
- [x] 2.3 Implement inline editing for card-visible node text fields
- [x] 2.4 Add status dropdown directly on node card and keep enum validation

## 3. Node Action Layout and Delete Controls

- [x] 3.1 Move node actions to top-right and enforce order: Collapse/Expand, Status, +
- [x] 3.2 Replace separate collapse/expand controls with one toggle button
- [x] 3.3 Expose edge delete interaction (selection + delete trigger)
- [x] 3.4 Expose node delete interaction and include connected-edge deletion behavior

## 4. Workspace Layout and Display Controls

- [x] 4.1 Move Task Parking Lot panel from right side to left-side support area
- [x] 4.2 Extend Custom Display settings with task list visibility toggle
- [x] 4.3 Ensure node card rendering respects the new task-list display flag

## 5. Verification and Stability

- [x] 5.1 Verify undo restores node/edge deletion and field edits in expected order
- [x] 5.2 Verify double-click modal, inline edits, and drag/select interactions do not conflict
- [x] 5.3 Verify left-side parking lot workflow remains functional for add/remove/convert actions
- [x] 5.4 Run npm run build and fix any TypeScript or lint errors introduced by this change
