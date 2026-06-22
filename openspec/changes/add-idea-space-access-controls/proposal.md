## Why

The project needs lightweight access control before backend auth is introduced, so users can mark projects as read-only or password-gated with predictable behavior. At the same time, Idea Space metadata should be expanded and surfaced on the homepage list to improve project scanning and management.

## What Changes

- Add Idea Space fields: `category`, `author`, `viewPassword`, `editPassword`, and `readOnly`.
- Sync the new Idea Space fields from homepage project creation inputs into the project snapshot.
- Add frontend-only password gating for project access mode:
  - if passwords are configured, one password prompt validates in order `editPassword` then `viewPassword`.
  - resolved mode is either edit or read-only.
- Enforce read-only mode by blocking all snapshot-mutating actions (node/edge/parking lot/Idea Space edits and drag interactions).
- Update homepage project cards:
  - show selected Idea Space metadata.
  - keep top-right delete action, requiring password validation in order `editPassword` then `viewPassword` when passwords are configured.
- Store passwords as hash values with per-project salt; never render existing password values back in UI.
- Add inline help text (`?`) in Idea Space that explains mode behavior and password combinations.

## Capabilities

### New Capabilities
- `idea-space-access-controls`: Frontend read-only and password-based access mode resolution and enforcement for project open/edit/delete flows.
- `idea-space-metadata-sync-and-list-surface`: Idea Space metadata expansion, homepage create-time sync, and homepage card display integration.

### Modified Capabilities
- None.

## Impact

- Affected frontend pages/components:
  - homepage project creation and project cards
  - Idea Space panel
  - editor interaction guards (read-only enforcement)
- Affected state and persistence:
  - Idea Space type definitions
  - project creation snapshot initialization
  - project storage schema/backward compatibility handling
  - access session state for current project mode
- Security posture:
  - intentionally lightweight frontend protection only until backend auth is introduced later.
