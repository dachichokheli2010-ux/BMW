-- Successful member sign-ins only; never passwords, hashes or session tokens.
CREATE TABLE IF NOT EXISTS user_login_activity (
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 sign_in_count INTEGER NOT NULL DEFAULT 0 CHECK(sign_in_count >= 0),
 last_signed_in_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS login_activity_recent_idx ON user_login_activity(last_signed_in_at);
