# Phase 0: backend, accounts, garage and Academy audit

Audit date: 2026-10-19. Read-only audit of the existing working tree; no application files were changed for this report. Existing uncommitted work was retained. Findings below distinguish confirmed defects, code-supported risks, and requested capabilities that are absent. Browser/device behavior is covered separately by the main UI audit.

## Verification baseline

`npm run check` passed on the pre-change tree:

- 14 general verification groups, including catalog, route helper, comparison, imports, garage backup, search, tuning math and education content.
- Academy: 42 lessons and 141 questions; curriculum, rewards, achievements, resume, midnight completion, streak and review checks passed.
- Academy recovery/account-scoped draft and glossary checks passed.
- Academy translation check: 668/668 selected teaching strings, 42 lessons and 141 questions.
- Backend: 68 checks passed.
- Account synchronization: 38 checks passed.
- PostgreSQL: 24 checks passed using PGlite, including SQL, account/save/migration compatibility and API routing.

This baseline is not an end-to-end device test, production Neon test, deployed Vercel route test, or a global translation-completeness guarantee. Existing tests primarily use Node assertions, SQLite, PGlite and mocked account networking. No iOS Safari, Android Chrome, assistive technology, Lighthouse, or virtual keyboard result is claimed here.

## Confirmed defects

| ID | Priority | Finding and evidence | Reproduction / expected correction |
| --- | --- | --- | --- |
| BE-01 | High | Signup reveals email existence. `server/api.js:108` checks for an existing account, `:111`/`:114` return 409, while a new email returns a signed-in user and 201 at `:122`. Equal hashing cost prevents a cheap timing probe but does not hide the result. | Register the same email twice. Status and outcome disclose whether it exists. The requested no-enumeration flow needs a consistent response and email verification/recovery design. Login already uses the same error for unknown email and wrong password. |
| BE-02 | Medium | `/generation-guides` is a registered page in `public/routes.js:5`, but `vercel.json` has no corresponding rewrite. Local preview and Worker use `resolvePage`; Vercel static routing does not. | Direct navigation/refresh on that URL requires the Vercel rewrite. Existing route tests call only the helper and cannot detect this deployment gap. |
| AC-01 | Medium | The selected Engines & drivetrains path is lost after reload. The curriculum defines `powertrains` in `public/academy-content.js:97`, and `public/academy-ui.js:192` saves it, but the restore whitelist in `public/academy-state.js:7` omits it; `:18` retains the default `basics`. | Confirmed in Node: `restoreProgress({...emptyProgress(), selectedPath:'powertrains'}).selectedPath` returns `basics`. Derive the whitelist from the actual unit IDs or include the missing ID. |
| GR-01 | Medium | Garage backup silently omits two supported legacy lessons. `PERSONAL_GARAGE_LESSONS` in `public/personal-garage.js:13` contains 8 IDs, while `academyLessons` contains 10. The import filter at `:59` and read filter at `:115` drop `drivetrain-layouts:*` and `m-performance:*`. | Store either lesson's legacy completion, export and import a backup. Its raw legacy entry is lost. Derive the supported IDs from the curriculum/legacy catalog and retain valid completions. Academy v2 may separately retain migrated completion, but that does not preserve the complete legacy snapshot. |
| GR-02 | High | Backup validation and account validation disagree. `public/personal-garage.js:71` accepts any nonempty build ID up to 80 characters; `server/validation.js:17`/`:23` require a safe alphanumeric/underscore/hyphen ID. Browser build-name import also lacks the control-character rejection enforced by the server. Invalid imported records are then written into the current garage. | Confirmed in Node: a v3 backup containing build ID `ID with spaces` is accepted by `validatePersonalGarageBackup`; its returned garage is rejected by `validateGarage`. Import succeeds locally but account sync remains in an invalid-data error. Reuse equivalent validation before mutating storage. |
| UI-AC-01 | Medium | Account name fields omit an explicit `type` attribute in `public/account.js:35`/`:39`. `public/account.css:1` gives all account inputs 12px text. The mobile override in `public/mobile.css:67` matches explicit `[type=text]`, `[type=email]`, `[type=password]` and search/textarea controls, so it covers email/password but does not match the default-type name inputs. Show-password and tabs also have authored minimum heights of 36px/40px. | Add explicit text types or include default-type inputs in the 16px rule. Browser-computed bounds and iOS focus zoom still require device verification. The mobile account header already receives 44px sizing from the higher-specificity rule in `mobile.css:55`; it is not an established undersized-target defect. |

## Code-supported data-loss risks needing browser reproduction

- `public/academy-ui.js:224` ignores cross-tab progress changes while a lesson is active. `:93` later serializes the entire in-memory state. Two tabs that begin lessons from the same snapshot can overwrite each other's attempts/completions when the later save uses its stale snapshot. Add a shared-state merge or explicit local revision conflict handling and reproduce with two actual tabs.
- `public/tuning-workbench.js:133` converts unreadable saved-build storage to `[]` without a durable error state. `:140` can subsequently write the replacement list. A new save after corrupt/unreadable prior content can replace that prior blob. My Garage's export/import flow has stronger protective error handling; the tuning workbench should preserve/recover the original value before replacing it.

## Requested capability gaps

- No forgot-password, password reset, or email-verification routes exist. The route allowlist is `server/api.js:6`; the UI form is `public/account.js:35`. `DATABASE.md:51` also explicitly documents that these services are unconfigured. Google sign-in is absent; the Worker supports gateway-managed ChatGPT identity and Vercel/Node use passwords.
- Auth form validation runs on submit (`public/account.js:90` onward), rather than as the user types. Correct email input/autocomplete and password show/hide are already present.
- Guest account import is explicit, not automatic at login (`public/account-sync.js:174`). Favorites/builds are merged without duplicate IDs; the intended automatic merge behavior still needs a product change.
- Language is a local browser preference (`public/preferences.js:3`, `:755`). Account data/profile schema includes no language preference. There are no localized `/ka/` or `/ru/` page routes/hreflang definitions in `public/routes.js` or `vercel.json`.
- The general text observer translates only `aria-label`, `title` and `placeholder` (`public/preferences.js:687`), not image alt attributes, meta content, page titles, or document head strings.
- Academy currently publishes 141 questions, with `choice`, `order` and `match` types. There are photo questions, daily challenge, spaced review, learning paths, XP, levels, achievements and account-synced progress. The requested 300+ bank, Quick 10, timed mode, audio/sound questions and opt-in public leaderboard are not implemented.
- Answer positions are deterministically rotated once by ID in `public/academy-content.js:108`; `public/academy-ui.js:151` displays that array directly. Replaying the same lesson has the same choice order. Per-session randomized order is absent.
- The leaderboard is explicitly a personal record (`public/academy-ui.js:132`), with no invented players; the existing browser-supplied learning evidence is not sufficient for a trusted public ranking.
- My Garage has save/remove/compare plus backup export/import; it does not offer the full requested Favorites sort/share-list page. Account profile currently summarizes favorites/builds/lessons and supports name changes.

## Existing protections to retain

The backend already uses salted 600,000-iteration PBKDF2-SHA256 password hashes; hash-only bearer session storage; HttpOnly/SameSite cookies with Secure and `__Host-` on HTTPS; same-origin checks plus per-session CSRF on authenticated writes; parameterized SQL; request-size limits; database-backed auth throttling; account identity isolation; optimistic garage revisions; and bounded validated payloads. Keep these during later auth changes. A configured production email service and verification/recovery design are necessary to finish the requested email flows truthfully.

## Test gaps to close with the corresponding phase

- Route parity between `pageRoutes` and actual Vercel rewrites.
- Every curriculum unit ID round-trips through `restoreProgress` and server validation.
- Garage backup round-trip for all legacy lesson IDs, all permitted build IDs/names, and rejection before storage writes for server-incompatible values.
- Two-tab Academy edits, corrupted storage recovery, simultaneous account events and actual browser cookie behavior.
- Global locale coverage for all UI/content/head/alt strings, rather than selected Academy dictionaries only.
- Device UI/keyboard/focus/touch tests and performance/accessibility audits.
