// Shared D1/SQLite/PostgreSQL schema. All billing authority stays on the server.
export const collectorSchemaStatements=[
 `CREATE TABLE IF NOT EXISTS collector_workspaces (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, state TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision >= 1), updated_at DOUBLE PRECISION NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS collector_customers (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, customer_id TEXT UNIQUE NOT NULL, created_at DOUBLE PRECISION NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS collector_entitlements (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, provider TEXT NOT NULL DEFAULT 'stripe' CHECK(provider = 'stripe'), customer_id TEXT UNIQUE NOT NULL, subscription_id TEXT UNIQUE NOT NULL, price_id TEXT NOT NULL, status TEXT NOT NULL, current_period_end DOUBLE PRECISION NOT NULL, cancel_at_period_end INTEGER NOT NULL DEFAULT 0 CHECK(cancel_at_period_end IN (0,1)), last_event_created DOUBLE PRECISION NOT NULL, last_event_id TEXT NOT NULL, updated_at DOUBLE PRECISION NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS collector_billing_events (id TEXT PRIMARY KEY, created_at DOUBLE PRECISION NOT NULL, processed_at DOUBLE PRECISION NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS collector_checkouts (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, price_id TEXT NOT NULL, interval_key TEXT NOT NULL, request_key TEXT NOT NULL, session_id TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', expires_at DOUBLE PRECISION NOT NULL)`,
];
export const collectorTableColumns={
 collector_workspaces:['user_id','state','revision','updated_at'],
 collector_customers:['user_id','customer_id','created_at'],
 collector_entitlements:['user_id','provider','customer_id','subscription_id','price_id','status','current_period_end','cancel_at_period_end','last_event_created','last_event_id','updated_at'],
 collector_billing_events:['id','created_at','processed_at'],
 collector_checkouts:['user_id','price_id','interval_key','request_key','session_id','url','expires_at'],
};
export const collectorTableNames=Object.keys(collectorTableColumns);
