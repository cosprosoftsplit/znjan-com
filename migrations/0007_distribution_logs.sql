-- Founder / ambassador distribution logs for the permission-light pilot

CREATE TABLE IF NOT EXISTS sports_pilot_distribution_logs (
  id TEXT PRIMARY KEY,
  distributed_by_user_id TEXT REFERENCES users(id),
  distribution_date TEXT NOT NULL,
  location_name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  material_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sports_pilot_distribution_logs_date
  ON sports_pilot_distribution_logs(distribution_date);

CREATE INDEX IF NOT EXISTS idx_sports_pilot_distribution_logs_material
  ON sports_pilot_distribution_logs(material_type);
