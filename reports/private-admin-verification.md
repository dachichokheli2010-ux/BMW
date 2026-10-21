# Private administration and bug repairs — 21 October 2026

## Motron / Vercel repair — 21 October 2026

A read-only check of the current public deployment at `https://apex-theta-khaki.vercel.app` found that `/admin` returned its private page, `/api/auth/session` returned a valid signed-out account response, and `/api/garage` returned the expected signed-out `401`. `/api/admin/session` returned `200` with `configured: false`. This identifies missing or invalid deployed owner settings as the observed administrator blocker; it does not indicate a general account database outage. No credentials were submitted to the live site and no production data was changed.

The private login now explains that GitHub uploads exclude `.env.local`, names the required `ADMIN_LOGIN_EMAIL` and `ADMIN_PASSWORD_HASH` server settings, and explains the required Vercel redeploy. It also switches to this setup state if configuration is removed after the page loads, clearing the password and keeping protected data inaccessible. One pair of dotenv quotes and surrounding whitespace copied into hosting settings are normalized; the exact salted PBKDF2 format, actual password comparison, private cookies and CSRF checks remain enforced.

A separate PostgreSQL cold-start defect was reproduced with a data-only application role: PostgreSQL rejects `CREATE SCHEMA/TABLE IF NOT EXISTS` without creation privileges even when the schema is already provisioned. Runtime initialization now inspects first and skips DDL when all required columns exist, allowing the provisioned role to use administrator sessions and account analytics. Missing app tables still use locked additive initialization. Explicit `npm run db:migrate` retains schema/index application and needs the owner's schema privileges. The app-owned `apex` schema name remains unchanged to preserve existing records.

Vercel responses distinguish an absent connection (`503`, `DATABASE_NOT_CONFIGURED`), unavailable storage (`503`, `DATABASE_UNAVAILABLE`), and a reachable database with missing owner credentials (`200`, `configured: false`). Error bodies contain no connection strings, credential values, SQL text or raw database errors. Supported connection aliases also accept surrounding whitespace or dotenv quotes.

Focused verification passed 202 dedicated administrator checks, 113 private UI checks, 63 adapter checks and 28 Vercel routing checks. The PostgreSQL regression uses a real engine, creates a role without schema-creation privileges, signs in through the Vercel adapter, recovers its persisted session and reads protected account analytics. It also verifies that explicit migration recreates a missing index. Existing SQLite startup, transactions, saved records, legacy imports and public-table preservation remain covered.

The checkout has local owner credentials, but no linked/authenticated Vercel project, deployment token or live Neon connection. Those local credentials cannot be transferred to production through Git, and no hosting settings were changed in this pass. The observed live `configured: false` still requires the two private settings in the Vercel deployment environment. Final verification passed the complete `npm run check` suite within the Vercel build. It includes 202 private auth checks, 113 admin UI checks, 63 adapter checks, 28 Vercel routing checks, 110 real HTTP account checks, 93 account-sync checks and 556 community backend checks. Vercel validated 113 modules, 36 stylesheets, 833 asset references and 1,371 deep links; local HTTP availability passed 2,132 URLs. The rebuilt Worker also passed private login and protected analytics using the packaged environment-normalization module. Browser screenshot verification remains unavailable.

## Earlier 21 October update

The dashboard now has paginated server search, sorting and complete queue/history totals instead of a silent combined 100-record cap. Record summaries expand into a clearer photo/evidence/decision workspace. Notes remain in this tab across searches, pages, failed refreshes and other decisions. Loading, retry, stale-response, expired-session and failed-photo states have explicit recovery controls. Search and filters stay usable on phones.

The new **Accounts & sign-ins** tab shows real account names, private email addresses, registration dates, provider, password-configured status, active session counts and tracked successful sign-ins. Dedicated administrator records are excluded. Passwords and password hashes are never returned or displayed. Sign-in metadata is recorded atomically with session creation; it remains after logout. Historical activity before tracking is explicitly unknown.

Database repairs include concurrent SQLite startup/migration locking, consistent transaction results across adapters, guarded one-time legacy imports, Unicode name searches, atomic session replacement and recovery-link consumption. Failed writes preserve the previous login or recovery token. Private and member sessions reject malformed CSRF records, newly issued sessions survive tied creation timestamps, and rate-limit responses report the actual remaining window. Cross-tab account changes invalidate old in-flight saves and trigger session verification even when a save was busy.

Moderation verifies the status/timestamp shown on the form. A private operation claim, decision and audit event share one transaction, so concurrent/stale decisions or failed writes cannot silently replace another review or leave a temporary claim behind. Queue photo/profile metadata is fetched in batches, reducing database round trips.

Focused checks cover real SQLite/PostgreSQL behavior, rollback and races, account-directory privacy/paging, the redesigned UI, and a real isolated HTTP signup/login/admin/analytics/logout workflow. Final full-suite/build results are recorded at completion. Live Neon credentials are not configured in this checkout; these results do not claim inspection or repair of an external production database. Browser screenshot verification is unavailable.

Final verification passed: the complete `npm run check` suite within `npm run build:vercel`, 196 dedicated auth/account-directory checks, 107 admin UI checks, 80 core backend checks, 93 account-sync checks, 51 adapter checks, 556 community backend checks and 110 HTTP account checks. Worker and Vercel artifacts were rebuilt from the final source; Vercel validated 110 modules, 40 stylesheets, 834 asset references and 1,371 deep links. The HTTP asset audit passed all 2,127 URLs. A built-Worker smoke test exercised protected account analytics and confirmed that the internal administrator is excluded from the directory. The final phone metric-overflow adjustment also passed the Academy journey check before both artifacts were regenerated.

The earlier implementation and verification record follows.

Administration lives at `/admin` in a separate HTML page with its own email/password form, session cookie, dashboard and logout. Public navigation, accounts and search do not link or redirect into administration. The address is excluded from discovery and indexing; server authentication protects all administrative data and actions.

## Credentials and authorization

The requested owner credentials were configured locally. The password is stored as a salted PBKDF2-SHA256 record with 600,000 iterations in ignored `.env.local`; the plaintext password is absent from source and Git. Email matching is case-insensitive. Existing public account passwords are unchanged.

The private login was exercised over real HTTP using the requested credentials. Login, dashboard access, independence from the public website session, logout and rejection of the revoked session passed.

`ADMIN_LOGIN_EMAIL` and `ADMIN_PASSWORD_HASH` are private server settings. Ordinary site accounts and the old owner allowlists cannot grant administrator access. Admin cookies are HttpOnly, SameSite=Strict, Secure on HTTPS and expire after eight hours. Credential changes invalidate existing sessions. Admin mutations require the dedicated CSRF token and matching origin. The internal audit principal is excluded from registered-account totals.

## Dashboard

The separate workspace includes the pending queue, reviewed-car history with search and filters, recorded activity, eight community counters, private evidence, full-size photo links, approval, change requests, refresh and logout. Dashboard layout adapts to phone and desktop widths. Service errors remain visible, invalid payloads cannot masquerade as an empty queue, and expired sessions clear private content.

## Additional confirmed defects repaired

- Detail dialogs close on the actual backdrop while preserving clicks on interior padding.
- Garage imports reject impossible calendar dates.
- Full M recognition includes the 1 Series M, Z M and XM without treating M Performance cars as full M cars.
- Garage storage failures remain visible instead of producing false success messages.
- An import started by one account cannot finish inside a different account.
- Invalid service records and capacity failures display useful messages.

The existing account synchronization, API error, PostgreSQL migration and mobile-navigation fixes remain covered by the regression suite.

Verification includes 88 private-auth checks across SQLite and PostgreSQL, 76 dedicated admin UI checks, 110 real HTTP/Worker checks, 80 account synchronization checks, 38 public account UI checks and 25 API rewrite checks. The HTTP route audit passed all 2,080 URLs, including the separate private entry page. Browser tab lifecycle tests verify evidence redaction and fresh session checks; reviewer notes survive other reviews, tabs, refresh, filters and searches without using browser storage.

The full `npm run build:vercel` regression/build pipeline passed, including 220 community backend checks and 37 public page mounts. The final admin draft-filter fix additionally passed the expanded 76-check UI suite. Artifact validation checked 94 modules, 34 stylesheets, 681 runtime images, 812 asset references and 1,358 discovery links. Worker and Vercel bundles were regenerated from the final source.

Nested community and administrator API URLs now use an explicit shared serverless router. This follows Vercel's [shared function and rewrite guidance](https://vercel.com/docs/functions/runtimes/node-js). Its [rewrite behavior](https://vercel.com/docs/routing/rewrites) is covered by tests that preserve query parameters, request bodies, cookies and CSRF headers and reject unknown destinations. Local and Worker admin shells also block framing and caching.

## Verification limits

The earlier local owner configuration and real HTTP access were verified. No authenticated Vercel project connection is available in this checkout, so its private environment settings could not be updated. The deployment needs the same two private server settings; ignored local files are not uploaded by Git. The read-only live result and current verification limits are documented at the top of this report.

No browser connection was available for visual inspection. Responsive controller tests, DOM tests, real HTTP tests and deployment-artifact checks provide separate evidence. Existing catalog research and exact-photo gaps remain disclosed in the completeness reports. This work does not claim that every possible defect or content omission has been eliminated.
