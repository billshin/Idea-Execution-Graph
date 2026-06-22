## ADDED Requirements

### Requirement: Edge style is configurable with solid as default
The system SHALL support edge style options including solid, dashed, and arrow variants, and MUST default new edges to solid style.

#### Scenario: New edge defaults to solid
- **WHEN** a new edge is created between two nodes
- **THEN** the edge is rendered and persisted with solid style unless the user changes it

#### Scenario: User changes edge style
- **WHEN** the user selects a different style option for an existing edge
- **THEN** the edge is rendered with the selected style and the style value is saved in snapshot data

### Requirement: Edge color follows target node status color by default
The system SHALL render edge color using the connected target node status color mapping by default.

#### Scenario: Edge color reflects target status at creation time
- **WHEN** an edge connects to a target node with a known status color
- **THEN** the edge color matches the target node status color

#### Scenario: Edge color updates when target status changes
- **WHEN** the target node status changes to another mapped status
- **THEN** the connected edge color updates to the new target status color mapping

### Requirement: Legacy snapshots remain compatible for edge styles
The system MUST load snapshots that do not contain edge style metadata by applying default solid style values.

#### Scenario: Import old snapshot without style metadata
- **WHEN** a snapshot created before edge-style support is loaded
- **THEN** all edges render as solid and operate without runtime errors
