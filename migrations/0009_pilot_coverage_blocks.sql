-- Founder / helper coverage blocks for the permission-light pilot

CREATE TABLE IF NOT EXISTS sports_pilot_coverage_blocks (
  id TEXT PRIMARY KEY,
  scheduled_by_user_id TEXT REFERENCES users(id),
  coverage_date TEXT NOT NULL,
  slot_start TEXT NOT NULL,
  slot_end TEXT NOT NULL,
  role TEXT NOT NULL,
  person_name TEXT NOT NULL,
  focus_area TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sports_pilot_coverage_blocks_date
  ON sports_pilot_coverage_blocks(coverage_date);

CREATE INDEX IF NOT EXISTS idx_sports_pilot_coverage_blocks_role
  ON sports_pilot_coverage_blocks(role);

CREATE INDEX IF NOT EXISTS idx_sports_pilot_coverage_blocks_active_date
  ON sports_pilot_coverage_blocks(coverage_date, slot_start)
  WHERE is_active = 1;
