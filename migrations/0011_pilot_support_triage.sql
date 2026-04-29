ALTER TABLE pilot_support_signals
ADD COLUMN triage_status TEXT NOT NULL DEFAULT 'new';

ALTER TABLE pilot_support_signals
ADD COLUMN triage_updated_at TEXT;

UPDATE pilot_support_signals
SET triage_updated_at = COALESCE(triage_updated_at, created_at)
WHERE triage_updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pilot_support_signals_status
ON pilot_support_signals(triage_status, is_archived, created_at DESC);
