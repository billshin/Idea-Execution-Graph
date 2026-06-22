## ADDED Requirements

### Requirement: Users can add connected nodes above and below
The system SHALL provide explicit actions on a node to create a new connected node above or below the selected node.

#### Scenario: Add node above current node
- **WHEN** the user triggers the add-above action on a node
- **THEN** the system creates a new node positioned above the current node and creates an edge from the current node to the new node

#### Scenario: Add node below current node
- **WHEN** the user triggers the add-below action on a node
- **THEN** the system creates a new node positioned below the current node and creates an edge from the current node to the new node

### Requirement: Directional insertion persists in snapshots
The system MUST persist nodes and edges created by directional insertion in project snapshot data.

#### Scenario: Reload project after directional insertion
- **WHEN** a project containing above/below inserted nodes is saved and reloaded
- **THEN** the inserted nodes and connecting edges remain present with their saved positions and links
