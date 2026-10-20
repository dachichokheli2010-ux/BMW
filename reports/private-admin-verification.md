# Private administration and bug repairs — 20 October 2026

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

The local owner configuration and real HTTP access were verified. The live Vercel integration is available but unconnected, so its private environment settings could not be updated. The deployment needs the same two private server settings; ignored local files are not uploaded by Git.

No browser connection was available for visual inspection. Responsive controller tests, DOM tests, real HTTP tests and deployment-artifact checks provide separate evidence. Existing catalog research and exact-photo gaps remain disclosed in the completeness reports. This work does not claim that every possible defect or content omission has been eliminated.
