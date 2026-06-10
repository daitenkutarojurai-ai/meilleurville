-- Cloudflare D1 schema for `meilleurville` (binding `DB` in wrangler.toml).
-- Reconstructed from the runtime stores: lib/comments-store.ts,
-- lib/contact-store.ts, lib/alertes-store.ts, lib/newsletter-store.ts.
-- Idempotent — safe to re-apply. Apply with:
--   wrangler d1 execute meilleurville --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS comments (
  id               TEXT PRIMARY KEY,
  topic            TEXT NOT NULL,
  author           TEXT NOT NULL,
  body             TEXT NOT NULL,
  rating           INTEGER,
  category_ratings TEXT,
  type             TEXT NOT NULL DEFAULT 'comment',
  created_at       TEXT NOT NULL,
  -- R9: nullable account binding. Anonymous comments leave this NULL; authed
  -- submissions stamp the user id so the dashboard can list a user's own posts.
  user_id          TEXT
);
CREATE INDEX IF NOT EXISTS idx_comments_topic_created
  ON comments (topic, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user
  ON comments (user_id, created_at DESC);

-- Existing databases: add the column once (D1 has no IF NOT EXISTS for columns,
-- so this errors harmlessly on re-apply — run it manually the first time):
--   ALTER TABLE comments ADD COLUMN user_id TEXT;

CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY,
  topic      TEXT NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  body       TEXT NOT NULL,
  locale     TEXT NOT NULL DEFAULT 'fr',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alertes (
  id                          TEXT PRIMARY KEY,
  email                       TEXT NOT NULL,
  city_slug                   TEXT NOT NULL,
  city_name                   TEXT NOT NULL,
  types                       TEXT NOT NULL,
  score_threshold             REAL,
  last_notified_score         REAL NOT NULL,
  last_notified_comment_count INTEGER NOT NULL,
  unsubscribe_token           TEXT NOT NULL,
  subscribed_at               TEXT NOT NULL,
  active                      INTEGER NOT NULL DEFAULT 1,
  locale                      TEXT NOT NULL DEFAULT 'fr'
);
CREATE INDEX IF NOT EXISTS idx_alertes_city   ON alertes (city_slug);
CREATE INDEX IF NOT EXISTS idx_alertes_email  ON alertes (email);
CREATE INDEX IF NOT EXISTS idx_alertes_token  ON alertes (unsubscribe_token);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  locale     TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_newsletter_email_locale
  ON newsletter_subscribers (email, locale);

-- Global daily Claude/AI call budget (cost backstop — see lib/ai-budget.ts).
-- One row per UTC day; the worker upserts and compares against AI_DAILY_BUDGET.
-- The worker also creates this lazily, so applying it here is optional but tidy.
CREATE TABLE IF NOT EXISTS ai_budget (
  day   TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

-- ───── R9: accounts (Worker-native magic-link auth) ────────────────────────
-- Passwordless: a user proves identity by clicking an emailed one-time link,
-- then trades it for a session JWT. See lib/auth-store.ts + lib/auth-tokens.ts.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL,
  handle        TEXT,
  created_at    TEXT NOT NULL,
  last_login_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));

-- Magic-link tokens. Only the SHA-256 HASH is stored; single-use + expiring.
CREATE TABLE IF NOT EXISTS login_tokens (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  consumed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_login_tokens_expires ON login_tokens (expires_at);

-- Account-persisted city bookmarks (R9.2).
CREATE TABLE IF NOT EXISTS favorites (
  user_id    TEXT NOT NULL,
  city_slug  TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, city_slug)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id, created_at DESC);

-- Saved 5-year projections (R9.5 persistence).
CREATE TABLE IF NOT EXISTS projections (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  city_slug  TEXT NOT NULL,
  city_name  TEXT NOT NULL,
  label      TEXT NOT NULL,
  payload    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projections_user ON projections (user_id, created_at DESC);

-- Per-page 👍/👎 feedback (anonymous). Mirrors the contact pipeline: stored in
-- D1 and optionally forwarded by email. No account binding.
CREATE TABLE IF NOT EXISTS page_feedback (
  id         TEXT PRIMARY KEY,
  path       TEXT NOT NULL,
  sentiment  TEXT NOT NULL,          -- 'up' | 'down'
  comment    TEXT,
  locale     TEXT NOT NULL DEFAULT 'fr',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_path ON page_feedback (path, created_at DESC);

-- Shared fixed-window rate-limit counters (lib/rate-limit.ts rateLimitD1).
-- The in-memory limiter is per-isolate; money-relevant limits (AI, auth, email)
-- need a counter that survives isolate recycling and is shared across colos.
-- Expired rows are purged by the Monday cron.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket     TEXT PRIMARY KEY,        -- "<key>:<window-slot>"
  count      INTEGER NOT NULL,
  expires_at INTEGER NOT NULL         -- epoch ms
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry ON rate_limits (expires_at);
