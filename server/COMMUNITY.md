# Community backend setup

The community uses the same authenticated database as accounts. It does not use
browser local storage as a source of spendable credits, administrator access or
published submissions.

## Database and deployments

- Local preview: SQLite migrations `0003_community.sql` and
  `0004_mastery_rounds.sql` are applied additively on startup. Existing accounts,
  garage rows, wallet balances and reward history are retained.
- Vercel / Neon: set `DATABASE_URL` in the server environment. The existing
  PostgreSQL initializer creates the community tables in the app-owned `apex`
  schema. `npm run db:migrate` and `npm run db:check` also include them. Existing
  `public` tables are never dropped or altered.
- Worker / D1: apply the numbered SQL migrations before enabling community
  routes. The portable API uses the same tables and parameter bindings.
- Back up the database using the hosting provider's normal backup mechanism.
  Uploaded photos are database rows, so they travel with the submissions in a
  database backup. No temporary filesystem or third-party upload bucket is used.

## Private administrator sign-in

Open `/admin` directly in the address bar. Public navigation, public account
pages and search discovery do not advertise the workspace. It has its own
email/password form, session cookie and logout, independent of public accounts.
There is no administrator registration or recovery route.

Set `ADMIN_LOGIN_EMAIL` and `ADMIN_PASSWORD_HASH` in the **server environment
only**. The password record uses the existing salted PBKDF2-SHA256 format with
600,000 iterations. `npm run admin:configure` configures the ignored local
`.env.local` file; `npm run admin:check` reports configuration status without
printing credentials. Local files do not update a running deployment. Configure
the same two variables through the deployment provider's private server secrets
before deploying. On Vercel, enable the variables for Production and any Preview
environment you use, then redeploy; existing deployments do not read a changed
local file. A `200` response from `/api/admin/session` with `configured: false`
means the database API responded but the deployed owner credentials are missing
or invalid. Database configuration/outage failures instead return `503` with
`DATABASE_NOT_CONFIGURED` or `DATABASE_UNAVAILABLE`. Surrounding whitespace and
one pair of dotenv quotes are accepted without changing the credential record.
Never commit them to source code, browser assets or
`vercel.json`. No email delivery provider or pre-existing public account is
required for administrator sign-in.

Public account responses always report `isAdmin: false`, `role: 'member'` and
`redirectTo: '/account'` after login. Legacy `ADMIN_EMAILS` and `ADMIN_USER_IDS`
allowlists cannot grant private workspace access, even to a verified account.
The public API does not expose administrator configuration or owner addresses.

Dedicated administrator cookies are HttpOnly, SameSite=Strict and Secure on
HTTPS. Sessions expire after eight hours; only hashed, namespaced tokens are
stored in the existing session table. Changing either server credential
invalidates previous administrator tokens. A non-login audit principal is
created after a successful administrator login to preserve existing moderation
foreign keys, without adding a public account or changing account credentials.
It is excluded from public account totals. Login is rate limited and all writes
require the exact site origin. Authenticated administrator writes additionally
require their own CSRF token.

The workspace shows the private moderation queue and database counts. A
submission becomes public only after administrator approval. Rejecting an
approved car removes both its public record and anonymous photo access. No
email notifications are sent by this feature.

## Credits and review rules

- A mastery round contains five application questions, one from each topic.
  Options are shuffled on the server; questions do not repeat within that day's
  five rounds. Answers and sourced explanations are revealed after submission.
- A score of at least 4/5 earns 3 credits. At most three rounds (9 credits) pay
  each UTC day. Five attempts are available per day, including failed and
  expired rounds. There is no speed bonus. Rounds expire after 15 minutes or at
  UTC midnight, whichever comes first; refreshing resumes the same active round.
- Completion, the reward receipt and wallet payment share one database
  transaction. Replays, concurrent starts and submissions cannot multiply
  attempts or rewards. Existing balances are never repriced.
- Academy collection credits remain separate: first lesson completions require
  at least 80% first-answer accuracy for 2 credits (3 for a perfect run; 4 for a
  checkpoint). A qualifying daily session earns 1 credit. Reviews earn XP only;
  completed lessons cannot be replayed for extra credits. Existing Academy XP,
  balances, completions and history remain intact.
- The initial submission costs 50 community credits. Retrying a pending request
  does not charge twice. Correcting and resubmitting the same rejected car does
  not charge again. Browser Arcade / Academy XP remains separate.
- Drafts and private evidence are visible only to the owner and administrators.
  Pending cars and their photographs are not public. Rejected cars are editable;
  pending and approved cars cannot be silently edited by the owner.
- Uploaded evidence is reviewed by a person. Moderation does not automatically
  prove ownership, manufacturer certification or mechanical condition.

## Photos and sharing privacy

Each car can hold three JPEG or WebP photos, at most 200 KiB each. Resize them in
the browser before sending. The server checks MIME, byte signatures, dimensions,
container boundaries and size; strips JPEG EXIF / comments and WebP metadata;
rejects animated WebP, SVG and unsupported formats; and serves bytes with the
validated raster MIME and `nosniff`. Images remain protected until approval.
Mask number plates, faces and home addresses before uploading. Private proof is
plain text for the administrator; do not upload identity documents.

Garage sharing is off until the account owner opts in. A 256-bit random link
publishes only public driver profile, synced model favourites and saved tuning
build names / model IDs / configuration choices. Account email, internal user
ID, Academy data, service history, odometer, costs and internal receipts are
excluded. The view is read-only, has no-store headers, and revoking the link
invalidates it immediately. Enabling it again creates a different token.
Friendships require an explicit request and recipient acceptance; either side
can remove them. Only an explicitly public driver handle can be searched.

## Frontend contract

Public account writes use the same-origin public session cookie and
`X-CSRF-Token` from `GET /api/auth/session`. Administrator writes use the
separate private cookie and token from `GET /api/admin/session` or its login
response. JSON content type is required. Errors return
`{error,code?}` with an appropriate HTTP status. All API responses are no-store.

| Endpoint | Method and request | Response |
| --- | --- | --- |
| `/api/community` | GET, signed in | `{profile,credits,isAdmin,share,counts}` |
| `/api/community/profile` | PUT `{handle,displayName,bio}` | `{profile}` |
| `/api/community/friends` | GET | `{friends,incoming,outgoing}` |
| same | POST `{handle}` | `{id,message}` |
| same | PATCH `{id,action:'accept'\|'decline'}`; DELETE `{id}` | `{ok:true}` |
| `/api/community/garage-share` | GET; POST `{}` to enable; DELETE to revoke | `{enabled,token?,url?}` |
| `/api/community/shared-garage?token=...` | GET, public | `{owner,garage:{favorites,builds},updatedAt}` |
| `/api/community/challenge` | GET, signed in; read/resume only | `{challenge:{id,questions,expiresAt,total:5,requiredCorrect:4,language}\|null,credits}` |
| same | POST `{action:'start'}`; optional `?language=en\|ka\|ru` | `{challenge,credits,message?}`; creates or resumes the account's active round |
| same | POST `{id,answers:[0,1,2,3,0]}`; five zero-based indices | `{correct,score,total,requiredCorrect,awarded,results,credits}` |
| `/api/community/cars` | GET, public; optional `?id=...` | `{cars}` or `{car}`; approved only |
| `/api/community/submissions` | GET, signed in; optional `?id=...` | `{submissions}` or `{submission}` |
| same | POST car fields to create draft; PUT same fields plus `id` | `{submission}` |
| `/api/community/submissions/submit` | POST `{id}` | `{submission,credits}` |
| `/api/community/car-photo?id=...` | GET | Authorised JPEG / WebP bytes |
| `/api/admin/session` | GET | `{configured,user:null\|{id,name},csrfToken:null\|string}` |
| `/api/admin/login` | POST `{email,password}` | Private session snapshot and cookie |
| `/api/admin/logout` | POST `{}`; private CSRF token | Signed-out snapshot and expired private cookie |
| `/api/admin/community` | GET, administrator | `{stats,pending,submissions,recentActivity}` |
| `/api/admin/moderation` | POST `{id,action:'approve'\|'reject',note}` | `{submission}` |

Car fields: `title`, `model`, integer `year`, `engine`, `transmission`, optional
integer `horsepower` or null, `description` (30–4000 characters),
`modifications`, private `evidence`, optional `photos`. A new photo is
`{data:'data:image/jpeg;base64,...',caption}`. An existing photo can be retained
in an edit as `{id,caption?}`; captions are limited to 150 characters. Omitting
`photos` entirely preserves the current photos.
Responses contain photos as `{id,url,caption,width,height}`, never their base64
payload. Public car responses exclude evidence, moderator notes and account IDs.

Friend rows have `{id,profile:{handle,displayName,bio},createdAt,garageUrl?}`;
`garageUrl` is present only for accepted friends when that driver has explicitly
enabled sharing. Share URLs use the canonical `/garage/:token` page route.
Credits are `{balance,submissionCost:50,reward:3,dailyLimit:3,dailyCreditLimit:9,
earnedToday,attemptLimit:5,attemptsToday,attemptsRemaining}`. `earnedToday` counts
paid rounds, not credits. Public questions contain `{id,topic,prompt,options}`;
only submitted results add `selected`, `answer`, `correct`, `explanation` and
`source:{label,url}`. A round keeps the language selected when it was issued.

Run `node scripts/check-community-backend.mjs` for isolated SQLite and PGlite
PostgreSQL checks. It creates temporary test accounts only, verifies permission
boundaries and persistence, and never reads deployment secrets or a real DB.
`node scripts/check-admin-auth.mjs` exercises private login, cookie isolation,
CSRF, rate limits and credential rotation against both database engines.
