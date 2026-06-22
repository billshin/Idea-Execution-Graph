## 1. Data Model and Persistence

- [x] 1.1 Extend Idea Space types/defaults with `category`, `author`, `readOnly`, and password hash structures for `viewPassword` and `editPassword`.
- [x] 1.2 Add password hashing utilities (Web Crypto SHA-256) and per-project salt generation helpers.
- [x] 1.3 Update project creation initialization to sync homepage inputs into `snapshot.ideaSpace` for all new fields.
- [x] 1.4 Add backward-compatible normalization for older projects missing new Idea Space fields.
- [x] 1.5 Ensure persisted password values are stored as hashes only and never written as plaintext.

## 2. Access Resolution and Session Mode

- [x] 2.1 Add access session state to resolve project mode (`edit` or `read-only`) after password validation.
- [x] 2.2 Implement conditional password prompt on project open only when `viewPassword` or `editPassword` is configured.
- [x] 2.3 Implement verification order `editPassword` then `viewPassword` and map result to mode.
- [x] 2.4 Implement fallback mode resolution when passwords are absent (`readOnly=true` => read-only, otherwise edit).
- [x] 2.5 Reuse the same verification order for protected project deletion from homepage cards.

## 3. Read-only Enforcement

- [x] 3.1 Add store-level mutation guards to block all snapshot-modifying actions in read-only mode.
- [x] 3.2 Disable UI editing affordances in read-only mode (dragging, add/delete/update controls, edit inputs).
- [x] 3.3 Hide `editPassword` input/value in read-only mode views.
- [x] 3.4 Verify delete/edit entry points cannot bypass read-only and access checks via direct action calls.

## 4. UI Integration

- [x] 4.1 Update homepage create form to collect `category`, `author`, `readOnly`, and optional password inputs.
- [x] 4.2 Update Idea Space panel to edit new metadata fields and password inputs without revealing stored values.
- [x] 4.3 Add Idea Space `?` help disclosure with mode matrix and password behavior explanation.
- [x] 4.4 Update homepage project cards to show selected Idea Space metadata and avoid exposing password data.
- [x] 4.5 Update homepage delete interaction to use password prompt for protected projects.

## 5. Verification

- [ ] 5.1 Validate mode matrix scenarios: public edit, read-only flag, view-password read-only, edit-password edit.
- [ ] 5.2 Validate protected delete scenarios for both password-protected and public projects.
- [ ] 5.3 Validate migration behavior by loading existing projects created before this change.
- [x] 5.4 Run build and type checks to ensure no regressions in routing, persistence, and editor interactions.
