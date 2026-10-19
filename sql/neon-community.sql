-- Additive community schema; keep existing apex/public tables and rows.
BEGIN;
SELECT pg_advisory_xact_lock(7491832);
CREATE TABLE IF NOT EXISTS apex.community_profiles (user_id TEXT PRIMARY KEY REFERENCES apex.users(id) ON DELETE CASCADE, handle TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL, bio TEXT NOT NULL DEFAULT '', created_at DOUBLE PRECISION NOT NULL, updated_at DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS apex.community_friends (id TEXT PRIMARY KEY, requester_id TEXT NOT NULL REFERENCES apex.users(id) ON DELETE CASCADE, recipient_id TEXT NOT NULL REFERENCES apex.users(id) ON DELETE CASCADE, pair_key TEXT UNIQUE NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','accepted')), created_at DOUBLE PRECISION NOT NULL, updated_at DOUBLE PRECISION NOT NULL, CHECK(requester_id <> recipient_id));
CREATE INDEX IF NOT EXISTS community_friends_recipient_idx ON apex.community_friends(recipient_id,status);
CREATE TABLE IF NOT EXISTS apex.community_shares (user_id TEXT PRIMARY KEY REFERENCES apex.users(id) ON DELETE CASCADE, token TEXT UNIQUE NOT NULL, created_at DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS apex.community_wallets (user_id TEXT PRIMARY KEY REFERENCES apex.users(id) ON DELETE CASCADE, balance INTEGER NOT NULL DEFAULT 0 CHECK(balance >= 0), last_operation TEXT, updated_at DOUBLE PRECISION NOT NULL);
CREATE TABLE IF NOT EXISTS apex.community_credit_ledger (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES apex.users(id) ON DELETE CASCADE, amount INTEGER NOT NULL, reason TEXT NOT NULL, source_key TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL, UNIQUE(user_id,source_key));
CREATE INDEX IF NOT EXISTS community_credits_user_idx ON apex.community_credit_ledger(user_id,created_at);
CREATE TABLE IF NOT EXISTS apex.community_challenges (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES apex.users(id) ON DELETE CASCADE, question_id TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL, expires_at DOUBLE PRECISION NOT NULL);
CREATE INDEX IF NOT EXISTS community_challenges_user_idx ON apex.community_challenges(user_id,expires_at);
CREATE TABLE IF NOT EXISTS apex.community_cars (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES apex.users(id) ON DELETE CASCADE, title TEXT NOT NULL, model TEXT NOT NULL, year INTEGER NOT NULL, engine TEXT NOT NULL, transmission TEXT NOT NULL, horsepower INTEGER, description TEXT NOT NULL, modifications TEXT NOT NULL, evidence TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','pending','approved','rejected')), moderation_note TEXT NOT NULL DEFAULT '', moderated_by TEXT REFERENCES apex.users(id), submitted_at DOUBLE PRECISION, reviewed_at DOUBLE PRECISION, credit_spent INTEGER NOT NULL DEFAULT 0, created_at DOUBLE PRECISION NOT NULL, updated_at DOUBLE PRECISION NOT NULL);
CREATE INDEX IF NOT EXISTS community_cars_status_idx ON apex.community_cars(status,updated_at);
CREATE INDEX IF NOT EXISTS community_cars_owner_idx ON apex.community_cars(user_id,updated_at);
CREATE TABLE IF NOT EXISTS apex.community_photos (id TEXT PRIMARY KEY, car_id TEXT NOT NULL REFERENCES apex.community_cars(id) ON DELETE CASCADE, mime TEXT NOT NULL CHECK(mime IN ('image/jpeg','image/webp')), data TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, caption TEXT NOT NULL, position INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS community_photos_car_idx ON apex.community_photos(car_id,position);
CREATE TABLE IF NOT EXISTS apex.community_audit (id TEXT PRIMARY KEY, actor_id TEXT REFERENCES apex.users(id) ON DELETE SET NULL, action TEXT NOT NULL, car_id TEXT REFERENCES apex.community_cars(id) ON DELETE SET NULL, note TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL);
COMMIT;
