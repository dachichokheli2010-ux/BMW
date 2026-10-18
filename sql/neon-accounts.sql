-- App-owned schema only. Existing public tables and their rows are preserved.
BEGIN;
SELECT pg_advisory_xact_lock(7491832);
CREATE SCHEMA IF NOT EXISTS apex;
CREATE TABLE IF NOT EXISTS apex.users (id TEXT PRIMARY KEY, provider TEXT NOT NULL, email TEXT UNIQUE, name TEXT NOT NULL, password_hash TEXT, created_at DOUBLE PRECISION NOT NULL, updated_at DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS apex.sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES apex.users(id) ON DELETE CASCADE, csrf_token TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL, expires_at DOUBLE PRECISION NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON apex.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON apex.sessions(expires_at);
CREATE TABLE IF NOT EXISTS apex.auth_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start DOUBLE PRECISION NOT NULL, expires_at DOUBLE PRECISION NOT NULL);
CREATE INDEX IF NOT EXISTS auth_limits_expiry_idx ON apex.auth_limits(expires_at);
CREATE TABLE IF NOT EXISTS apex.user_garages (user_id TEXT PRIMARY KEY REFERENCES apex.users(id) ON DELETE CASCADE, state TEXT NOT NULL, revision INTEGER NOT NULL, updated_at DOUBLE PRECISION NOT NULL);
COMMIT;
