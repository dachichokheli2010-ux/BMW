# Repair verification — 20 October 2026

This report records the earlier repair run. Current administration behavior is documented in [private admin verification](private-admin-verification.md).

This pass fixes observed defects in the existing website. It does not establish that every possible defect or content gap has been eliminated.

## Behavior repaired

- Structured account/community API errors produce readable messages instead of `[object Object]`.
- Server-authorized administrators receive an admin role and go directly to `/admin` after signing in. Account and community menus expose the workspace.
- The existing local owner account is pinned by immutable ID in ignored local configuration. Other accounts retain member access.
- Account sync protects existing cloud data when the first garage read fails and preserves recoverable local edits through reconnect/logout flows.
- Registration, login and hosted session renewal retain saved language preferences.
- PostgreSQL migration preserves legacy email verification and preferences. Revoked legacy sessions and consumed recovery tokens cannot be reimported on cold starts.
- Concurrent friendship requests cannot return an ID for a record that was never inserted.
- Manual Neon setup creates recovery, preference and community tables as well as the base account tables.
- Mobile navigation restores focus, scroll position and wrapped preference controls, tracks current routes, and handles close/reopen races.
- Account forms have more readable text, larger controls, better light-theme errors and narrow-screen spacing. Collection touch controls are at least 44 pixels high.
- Question reference pages render the actual photo object, correct answer, photo attribution and source links. Glossary definitions update when the selected language changes.

## Verification

The automated suite covers account APIs, SQLite and a real PostgreSQL engine through PGlite, account isolation, admin authorization, sync conflicts, recovery, community moderation, navigation, learning, data validation and lazy-loaded page mounting.

Final results: `npm run build` and `npm run build:vercel` passed. The latter includes the full `npm run check` suite. Focused counts include 71 backend, 19 real HTTP account, 80 synchronization, 32 account UI, 32 PostgreSQL, 212 community backend and 79 community UI checks. All 38 lazy-loaded page cases passed. The Vercel artifact validator checked 93 modules, 33 stylesheets, 681 runtime images, 810 asset references and 1,358 deep links.

The isolated HTTP account test starts a real local server with a temporary database. It verifies cookies, configured admin access, CSRF, stale-save rejection, profile language, durable favorites across restarts and logout revocation. It uses no existing account credentials or production database.

The public HTTP audit checked 1,358 discovery pages, 683 referenced images and 36 entry assets: all 2,077 URLs passed. The reference review rendered all 906 questions and glossary entries in English, Georgian and Russian without object text, missing referenced images or unresolved internal reference links.

Responsive DOM tests cover control relocation at 320/390/1120 pixels and desktop restoration at 1121/1200/1440 pixels. These validate controller behavior and stylesheet order, not browser layout geometry.

## Limits

The deployed Neon database and Vercel account were not connected to this workspace. Production owner access still requires the production account's verified email or its exact immutable ID in server `ADMIN_USER_IDS`. Local IDs are not assumed to match production. `npm run admin:check` reports access against the configured database without printing passwords or connection strings.

Visual browser verification could not finish: no browser connection was available, and the native Computer Use helper stopped because it could not confidently determine the current browser URL. Automated DOM and HTTP checks are separate evidence.

Existing factual research and exact-photo gaps remain visible in the completeness reports; this repair does not invent missing catalog facts or photographs.
