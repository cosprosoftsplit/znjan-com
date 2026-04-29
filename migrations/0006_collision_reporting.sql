-- Collision reporting for sports reservations transparency

CREATE TABLE IF NOT EXISTS sports_collision_reports (
  id TEXT PRIMARY KEY,
  reservation_id TEXT REFERENCES sports_reservations(id),
  resource_id TEXT NOT NULL REFERENCES sports_resources(id),
  reporter_user_id TEXT REFERENCES users(id),
  source TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  collision_date TEXT NOT NULL,
  slot_start TEXT NOT NULL,
  slot_end TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sports_collision_reports_date
  ON sports_collision_reports(collision_date);

CREATE INDEX IF NOT EXISTS idx_sports_collision_reports_resource_date
  ON sports_collision_reports(resource_id, collision_date);

CREATE INDEX IF NOT EXISTS idx_sports_collision_reports_reservation
  ON sports_collision_reports(reservation_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sports_collision_followup_unique
  ON sports_collision_reports(reservation_id, reporter_user_id, source)
  WHERE reservation_id IS NOT NULL AND source = 'reservation-followup';
