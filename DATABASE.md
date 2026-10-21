# Neon and Vercel

The production project uses Neon PostgreSQL through the server-only `DATABASE_URL` environment variable. The Neon resource name `apex-db` is a dashboard label; it is not a connection string or a table name. The application also accepts `POSTGRES_URL` and `NEON_DATABASE_URL`.

## Existing tables

The manually created public tables `users`, `lessons`, `questions`, `user_progress`, `user_stats`, `achievements`, and `user_achievements` are preserved. The application does not drop, alter, or overwrite them. Creating those tables alone does not connect them to the existing JavaScript curriculum.

Account and garage data lives in a separate PostgreSQL schema:

| Table | Purpose |
| --- | --- |
| `apex.schema_migrations` | Receipts for completed data imports |
| `apex.users` | Account names, email addresses and password hashes |
| `apex.sessions` | Revocable session token hashes and CSRF tokens |
| `apex.user_login_activity` | Successful member sign-in counts and latest sign-in time; no credentials or session tokens |
| `apex.auth_limits` | Login and mutation rate limits |
| `apex.user_garages` | Each account's favorites, tuning builds and academy progress |

The first account API request initializes these tables in one transaction. It takes a database advisory lock to avoid concurrent initialization. A matching account schema from an older app version in `public` is copied without removing its original rows, including email verification and language preferences. The import checks source column types and records completion in `apex.schema_migrations`; later server starts cannot recreate app rows that were subsequently removed. Unrelated public tables are ignored. Legacy session and recovery tokens are not copied: sign in again after a schema migration. This prevents a later server restart from restoring a session that was already revoked by logout or a password reset.

## Deploy the fix

1. Keep `DATABASE_URL` in the Vercel project's environment settings, enabled for each deployment environment you use. Do not expose it as a browser variable.
2. Deploy this checkout. Keep the individual account functions under `api/auth/`, `api/account/`, and `api/garage.js`. Community and private admin endpoints use `api/router.js` with the explicit rewrites in `vercel.json`; deploy the router and configuration together. The older single dynamic API file did not serve nested endpoints on the observed deployment.
3. Confirm `/api/auth/session` returns JSON with `user: null` while signed out. `/api/garage` should return JSON with status 401 while signed out, rather than 404 or a database error.
4. Create an account, save a BMW or build, sign out, and sign in on another browser to confirm persistence.

If the database role cannot create the `apex` schema, an owner can run `sql/neon-accounts.sql` in the Neon SQL Editor. That script only creates the app's schema and tables. It does not reset the database.

## Local checks against Neon

Put the full connection string in an ignored `.env.local` file as `DATABASE_URL=...`. Do not commit it. Then run:

```sh
npm run db:check
```

This check reads schema metadata only. It reports missing app columns without printing credentials, account records or password hashes. To create the missing app schema, run:

```sh
npm run db:migrate
```

`npm start` uses Neon whenever a connection variable is configured. Without one, it uses a persistent local SQLite database in `.data/`; that local database is separate from the deployed Neon database. A failed Neon connection does not silently switch an account to SQLite. Concurrent local starts wait for SQLite initialization and recheck migration receipts under the write lock, so each numbered migration applies once.

The retained `db:generate` command is for the existing SQLite/D1 schema. Its migrations are not PostgreSQL migrations. Use the Neon setup above for Vercel instead.

## Verification and limits

`npm run check` includes a real PostgreSQL engine test using PGlite, concurrent local SQLite initialization, transaction rollback and returned-row checks, account API tests, guest/account isolation, revision conflicts, one-time legacy imports, and preservation of the seven manually created public tables. It does not validate the credentials, privileges or deployed version in your Vercel account. Those require access to that connected deployment.

Learning progress is private account data, not a trusted multiplayer score. Email verification and email-based password recovery are not configured. Hosted Sites deployments continue to use their existing native ChatGPT identity; the Vercel and standalone Node deployments use the email/password account API.

The private `/admin` account directory reads real account totals, active unexpired sessions, registration dates and successful sign-in metadata. Tracking is committed in the same transaction as session creation and survives logout. Existing accounts without a tracking row show an unknown historical sign-in time; old login activity is not reconstructed. Passwords, password hashes, session/CSRF tokens and garage contents are excluded from this directory. The additive SQLite migration is `0005_login_activity.sql`; PostgreSQL initializes the matching app-owned table automatically.
