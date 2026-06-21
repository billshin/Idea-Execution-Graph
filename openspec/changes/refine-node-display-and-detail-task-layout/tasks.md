## 1. Node Defaults and Card Display

- [x] 1.1 Update default start-node values in constants/defaults (title, subtitle, label)
- [x] 1.2 Update `addConnectedNode` defaults for `+`-created nodes only (title, subtitle, label)
- [x] 1.3 Update node card field gating so optional sections hide when trimmed empty
- [x] 1.4 Reorder node card content so target date renders below conclusion
- [x] 1.5 Add completed-task visual class/state in node mini task list
- [x] 1.6 Add CSS rule to render completed mini task leading indicator in green

## 2. Node Detail Layout and Task Row Model

- [x] 2.1 Refactor Node Detail structure into left controls + right Markdown workspace layout
- [x] 2.2 Move Markdown editor area to right column and preserve preview usability
- [x] 2.3 Extend task creation/editing in Node Detail to support `conclusion` field
- [x] 2.4 Render task checklist rows in one-line order: checkbox, title, required, conclusion
- [x] 2.5 Ensure checkbox remains left-most in all task-row render states
- [x] 2.6 Add responsive wrapping/fallback behavior for narrow widths without changing column order

## 3. Modal Behavior and Verification

- [x] 3.1 Add Escape-key close behavior to NodeEdit modal lifecycle
- [x] 3.2 Ensure Escape handler registration/cleanup does not leak listeners
- [ ] 3.3 Validate start-node and plus-node defaults in a fresh workspace session
- [ ] 3.4 Validate empty-field hiding, task completion green cue, and Node Detail row layout manually
