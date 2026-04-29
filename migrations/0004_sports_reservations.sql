-- Public sports reservations for Znjan

CREATE TABLE IF NOT EXISTS sports_resources (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  reservation_mode TEXT NOT NULL DEFAULT 'exclusive',
  capacity INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sports_reservations (
  id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL REFERENCES sports_resources(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  reservation_date TEXT NOT NULL,
  slot_start TEXT NOT NULL,
  slot_end TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  cancelled_at TEXT,
  cancelled_by_user_id TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sports_blackouts (
  id TEXT PRIMARY KEY,
  resource_id TEXT REFERENCES sports_resources(id),
  blackout_date TEXT NOT NULL,
  slot_start TEXT NOT NULL,
  slot_end TEXT NOT NULL,
  reason TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sports_reservation_audit_log (
  id TEXT PRIMARY KEY,
  reservation_id TEXT REFERENCES sports_reservations(id),
  resource_id TEXT REFERENCES sports_resources(id),
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sports_reservations_resource_date
  ON sports_reservations(resource_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_sports_reservations_user_date
  ON sports_reservations(user_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_sports_blackouts_date
  ON sports_blackouts(blackout_date);
CREATE INDEX IF NOT EXISTS idx_sports_audit_reservation
  ON sports_reservation_audit_log(reservation_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sports_reservations_active_slot
  ON sports_reservations(resource_id, reservation_date, slot_start)
  WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS idx_sports_reservations_user_slot
  ON sports_reservations(user_id, reservation_date, slot_start)
  WHERE status = 'active';

INSERT OR IGNORE INTO sports_resources
  (id, slug, kind, reservation_mode, capacity, is_active, sort_order, created_at, updated_at)
VALUES
  ('sports-resource-beach-volleyball-1', 'beach-volleyball-1', 'court', 'exclusive', 1, 1, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sports-resource-beach-volleyball-2', 'beach-volleyball-2', 'court', 'exclusive', 1, 1, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sports-resource-beach-volleyball-3', 'beach-volleyball-3', 'court', 'exclusive', 1, 1, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sports-resource-tennis-court-1', 'tennis-court-1', 'court', 'exclusive', 1, 1, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sports-resource-basketball-court-1', 'basketball-court-1', 'court', 'exclusive', 1, 1, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sports-resource-cage-football-1', 'cage-football-1', 'pitch', 'exclusive', 1, 1, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
