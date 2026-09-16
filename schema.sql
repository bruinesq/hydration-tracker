-- Reference schema for HydrationTracker's Neon database.
-- These tables already exist in the live Neon project this app points to
-- (created by the original Next.js/Drizzle version). Kept here only so a
-- brand-new Neon project can be set up the same way if ever needed - this
-- file isn't run automatically by anything.

CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(50) NOT NULL,
  avatar_color      VARCHAR(20) NOT NULL DEFAULT '#38bdf8',
  gender            VARCHAR(20) NOT NULL, -- 'male' | 'female' | 'other'
  height_in         REAL NOT NULL,
  weight_lb         REAL NOT NULL,
  computed_goal_oz  REAL NOT NULL,
  goal_override_oz  REAL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drink_types (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  icon        VARCHAR(10) NOT NULL DEFAULT '💧',
  default_oz  REAL NOT NULL DEFAULT 8,
  is_custom   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS food_items (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(80) NOT NULL,
  category        VARCHAR(40),
  serving_label   VARCHAR(60) NOT NULL,
  oz_per_serving  REAL NOT NULL,
  source_note     TEXT
);

CREATE TABLE IF NOT EXISTS logs (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type    VARCHAR(10) NOT NULL, -- 'drink' | 'food'
  reference_id  INTEGER,
  label         VARCHAR(80) NOT NULL,
  oz_amount     REAL NOT NULL,
  logged_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
