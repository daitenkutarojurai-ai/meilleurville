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
  created_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_topic_created
  ON comments (topic, created_at DESC);

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
