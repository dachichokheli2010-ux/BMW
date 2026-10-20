-- Additive upgrade: existing wallet balances, ledger entries and car records
-- remain intact. Issued/expired rounds count toward the daily attempt limit.
CREATE TABLE IF NOT EXISTS community_mastery_rounds (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 day TEXT NOT NULL,
 attempt_no INTEGER NOT NULL,
 question_data TEXT NOT NULL,
 answers_json TEXT,
 score INTEGER,
 created_at DOUBLE PRECISION NOT NULL,
 expires_at DOUBLE PRECISION NOT NULL,
 completed_at DOUBLE PRECISION,
 UNIQUE(user_id,day,attempt_no)
);
CREATE UNIQUE INDEX IF NOT EXISTS community_mastery_active_idx ON community_mastery_rounds(user_id) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS community_mastery_day_idx ON community_mastery_rounds(user_id,day);
