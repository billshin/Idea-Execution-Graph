## Context

The app is currently a frontend-only React + Zustand implementation that stores projects in localStorage. There is no backend authorization boundary yet, but users need practical project-level access controls now. The change introduces lightweight, UI-enforced access modes and extends Idea Space metadata so creation and list browsing stay consistent.

Current constraints:
- Local-first data model (`IdeaProject.snapshot.ideaSpace`) is the source of truth.
- Existing project data must continue to load without migration failures.
- Interaction mutability is spread across multiple controls and store actions.

## Goals / Non-Goals

**Goals:**
- Add Idea Space fields: `category`, `author`, `viewPassword`, `editPassword`, `readOnly`.
- Support homepage create-time input and snapshot sync for the new metadata.
- Resolve access mode at open/delete time using password verification order: `editPassword` then `viewPassword`.
- Enforce read-only mode consistently for all snapshot-mutating actions.
- Display selected Idea Space metadata on homepage project cards.
- Store password-derived values only as salted hashes, never as plaintext and never re-displayed.

**Non-Goals:**
- Backend authentication/authorization.
- Cross-device identity or user account management.
- Cryptographic guarantees against malicious local users with DevTools/localStorage access.

## Decisions

1. Access control is modeled as frontend session state, not persisted grant tokens.
- Rationale: keeps scope small and compatible with backend migration later.
- Alternative considered: persistent unlocked state in localStorage; rejected due to weaker safety and stale access state risks.

2. Password fields are stored as `{salt, hash}` pairs per project using Web Crypto SHA-256.
- Rationale: avoids plaintext storage while keeping implementation simple.
- Alternative considered: plaintext for speed; rejected due to unnecessary exposure risk.

3. Password prompt is conditional.
- Rule: prompt only when either `viewPassword` or `editPassword` is configured.
- Resolution order: compare entered password against `editPassword` first, then `viewPassword`.
- Result mode: edit on `editPassword` match; read-only on `viewPassword` match.

4. Read-only enforcement uses dual-layer guards.
- UI layer disables controls and drag/edit affordances.
- Store layer no-ops all mutation actions when session mode is read-only.
- Rationale: prevents accidental bypass via direct action invocation.

5. Compatibility strategy for existing projects.
- Missing new Idea Space fields are normalized to defaults.
- Existing projects with no password fields remain editable unless `readOnly` is explicitly enabled.

## Risks / Trade-offs

- [Frontend-only protection can be bypassed] -> Mitigation: document as temporary guard and keep architecture ready for backend auth.
- [Guard coverage gaps could leave write paths open] -> Mitigation: centralize mutation guard in store and add regression checks for key actions.
- [Password hash migration complexity for old projects] -> Mitigation: one-way normalization with safe defaults and non-breaking loaders.
- [User confusion between read-only and password modes] -> Mitigation: add inline `?` help text explaining mode matrix and examples.

## Migration Plan

1. Extend Idea Space types and defaults with the new fields.
2. Update homepage create form and project initialization sync.
3. Add hashing utilities and persistence normalization for new password structures.
4. Implement access prompt and mode resolution for project open and delete.
5. Add read-only guards across editor UI and mutation actions.
6. Update homepage card metadata rendering.
7. Verify backward compatibility with previously saved projects.

Rollback strategy:
- Revert to previous type/persistence schema while preserving project records.
- Ignore new fields during load if rollback code cannot process them.

## Open Questions

- Should delete require edit-level validation only, or accept view-level validation as currently proposed?
- Should read-only (`readOnly=true`) be overridable by a valid `editPassword`, or always force read-only?
- Should failed password attempts include cooldown in this change or a follow-up?
