## 1. Edge Data Model and Defaults

- [x] 1.1 Extend edge type definitions to include style metadata (line style and arrow mode)
- [x] 1.2 Add default values for new edges (`solid` + no arrow)
- [x] 1.3 Add snapshot load normalization so legacy edges without style metadata fall back to defaults

## 2. Directional Node Expansion

- [x] 2.1 Add store actions to create connected nodes above and below a selected node
- [x] 2.2 Implement deterministic vertical placement offsets for top/bottom insertion
- [x] 2.3 Ensure directional insertion also creates connecting edges with default style metadata

## 3. Edge Style Editing and Rendering

- [x] 3.1 Add edge style controls in the UI to switch between solid, dashed, and arrow variants
- [x] 3.2 Persist user-selected edge style into store and snapshot payloads
- [x] 3.3 Update React Flow edge rendering to apply selected style metadata

## 4. Status-Driven Edge Coloring

- [x] 4.1 Derive edge stroke color from target node status color mapping by default
- [x] 4.2 Recompute connected edge colors when target node status changes
- [x] 4.3 Keep rendering stable when target nodes are filtered/collapsed

## 5. Verification

- [x] 5.1 Verify add-above/add-below actions create correctly positioned connected nodes
- [x] 5.2 Verify style options (solid/dashed/arrow) are visible, editable, and persisted after reload/export/import
- [x] 5.3 Verify edge colors track target node status changes as expected
- [x] 5.4 Run npm run build and resolve any TypeScript or lint errors introduced by this change
