## Why

Current node editing does not support explicit top/bottom node extension and edge styles are fixed, which limits visual planning and flow readability. Adding directional node insertion and configurable edge styling will make idea maps clearer and faster to organize.

## What Changes

- Add node extension actions to create connected nodes above and below the current node.
- Add editable edge style options: solid (default), dashed, and arrow variants.
- Make edge color follow the connected target node status color by default so link meaning stays consistent with node state.
- Persist edge style and color behavior in project snapshots so reload/export/import remain consistent.

## Capabilities

### New Capabilities
- `node-directional-expansion`: Allow users to add connected nodes above or below an existing node with predictable placement.
- `edge-style-and-status-coloring`: Allow users to set edge line style (solid/dashed/arrow) while defaulting edge color to the target node status color.

### Modified Capabilities
- None.

## Impact

- Affected code: graph store edge/node creation logic, node card actions, edge rendering/style mapping, snapshot types and persistence.
- Affected UI: node action controls, edge editing controls, and visual edge display.
- Data impact: edge metadata schema expanded to store style settings.
- Compatibility: old snapshots should still load with default edge style as solid.
