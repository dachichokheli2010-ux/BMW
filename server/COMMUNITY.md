# Community backend setup

The community uses the same authenticated database as accounts. It does not use
browser local storage as a source of spendable credits, administrator access or
published submissions.

## Database and deployments

- Local preview: the SQLite migration `drizzle/0003_community.sql` is applied
  additively on startup. Existing accounts and garage rows are retained.
- Vercel / Neon: set `DATABASE_URL` in the server environment. The existing
  PostgreSQL initializer creates the community tables in the app-owned `apex`
  schema. `npm run db:migrate` and `npm run db:check` also include them. Existing
  `public` tables are never dropped or altered.
- Worker / D1: apply the numbered SQL migrations before enabling community
  routes. The portable API uses the same tables and parameter bindings.
- Back up the database using the hosting provider's normal backup mechanism.
  Uploaded photos are database rows, so they travel with the submissions in a
  database backup. No temporary filesystem or third-party upload bucket is used.

## Explicit administrator configuration

Set `ADMIN_EMAILS` to a comma-separated list of owner email addresses in the
**server environment only**. These addresses grant access only after account
email verification. Configure the existing `RESEND_API_KEY`,
`ACCOUNT_MAIL_FROM` and `PUBLIC_ORIGIN` email settings to deliver verification
links. ChatGPT-hosted identities already supply verified email addresses.

This checkout configures the owner's requested email in the ignored
`.env.local` for `npm start` and in `vercel.json`'s server runtime `env` block
for the next Vercel deployment. It is not included in browser assets. Changing
local files does not change an already-running deployment. The existing local
owner account is also pinned by its exact immutable account ID in `.env.local`,
so local administration works without a mail provider. That local ID is not
copied into production. An email allowlist does not create an account or mark
an address as verified.

If email delivery is not available, the owner can instead set `ADMIN_USER_IDS`
to the exact immutable ID of their already-created account (for example,
`local:...`). Obtain that ID from their authenticated `/api/auth/session`
response or an authorised database inspection. A public driver handle is not
an account ID. Neither setting is sent to the browser, and the first registered
account is never automatically made an administrator.

Run `npm run admin:check` to inspect only the configured administrator accounts
in the active local or Neon database. It reports their immutable IDs and access
status without changing accounts, granting permissions or printing passwords.
The command requires the same server environment as the deployment being
diagnosed; a local SQLite account ID is separate from a Neon account ID.

Session, login and account profile responses include `user.isAdmin` and
`user.role` (`admin` or `member`), calculated from the current server settings on
every request. Login also returns `redirectTo: '/admin'` for administrators.
The `adminAccess` response reports whether any administrator is configured and
whether this signed-in account needs email verification. It never exposes
the allowlist. Email verification is offered only when a mail provider is
configured; otherwise use an explicitly authorized existing account ID.

The admin page shows the private moderation queue and database counts. A
submission becomes public only after an authorised administrator approves it.
Rejecting an already approved car removes both its public record and anonymous
photo access. No email notifications are sent by this feature.

## Credits and review rules

- A community credit challenge is issued by the server, expires after ten
  minutes and can be answered only once by its owner.
- A correct answer awards 5 credits. At most 10 unique questions are rewarded
  each UTC day. The balance and reward ledger are stored on the server.
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

All writes use the existing same-origin session cookie and `X-CSRF-Token` from
`GET /api/auth/session`; JSON content type is required. Errors return
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
| `/api/community/challenge` | GET, signed in | `{challenge:{id,prompt,options}\|null,credits,message?}` |
| same | POST `{id,answer}`; zero-based option index | `{correct,explanation,credits}` |
| `/api/community/cars` | GET, public; optional `?id=...` | `{cars}` or `{car}`; approved only |
| `/api/community/submissions` | GET, signed in; optional `?id=...` | `{submissions}` or `{submission}` |
| same | POST car fields to create draft; PUT same fields plus `id` | `{submission}` |
| `/api/community/submissions/submit` | POST `{id}` | `{submission,credits}` |
| `/api/community/car-photo?id=...` | GET | Authorised JPEG / WebP bytes |
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
Credits are `{balance,submissionCost:50,reward:5,dailyLimit:10,earnedToday}`.

Run `node scripts/check-community-backend.mjs` for isolated SQLite and PGlite
PostgreSQL checks. It creates temporary test accounts only, verifies permission
boundaries and persistence, and never reads deployment secrets or a real DB.
