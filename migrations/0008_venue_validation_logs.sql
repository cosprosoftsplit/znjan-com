CREATE TABLE IF NOT EXISTS venue_validation_logs (
  id TEXT PRIMARY KEY,
  venue_key TEXT NOT NULL,
  venue_label TEXT NOT NULL,
  venue_type TEXT NOT NULL,
  walk_date TEXT NOT NULL,
  outcome TEXT NOT NULL,
  offer_focus TEXT NOT NULL,
  contact_name TEXT,
  notes TEXT,
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_venue_validation_logs_walk_date
  ON venue_validation_logs(walk_date DESC);

CREATE INDEX IF NOT EXISTS idx_venue_validation_logs_venue_key
  ON venue_validation_logs(venue_key);

CREATE INDEX IF NOT EXISTS idx_venue_validation_logs_outcome
  ON venue_validation_logs(outcome);

