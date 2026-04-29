-- Public support / helper signals for the founder sprint

CREATE TABLE IF NOT EXISTS pilot_support_signals (
  id TEXT PRIMARY KEY,
  signal_type TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  availability TEXT,
  notes TEXT NOT NULL,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pilot_support_signals_created
  ON pilot_support_signals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pilot_support_signals_type
  ON pilot_support_signals(signal_type);
