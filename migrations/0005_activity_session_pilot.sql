-- Shared-capacity activity sessions for the sports reservation pilot

DROP INDEX IF EXISTS idx_sports_reservations_active_slot;

CREATE INDEX IF NOT EXISTS idx_sports_reservations_active_slot
  ON sports_reservations(resource_id, reservation_date, slot_start)
  WHERE status = 'active';

INSERT OR IGNORE INTO sports_resources
  (id, slug, kind, reservation_mode, capacity, is_active, sort_order, created_at, updated_at)
VALUES
  ('sports-resource-skate-session-beginner', 'skate-session-beginner', 'activity', 'shared-session', 8, 1, 70, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sports-resource-skate-session-open', 'skate-session-open', 'activity', 'shared-session', 12, 1, 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sports-resource-skate-session-sunset', 'skate-session-sunset', 'activity', 'shared-session', 12, 1, 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE sports_resources
SET reservation_mode = 'shared-session',
    capacity = 8,
    kind = 'activity',
    is_active = 1,
    sort_order = 70,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'sports-resource-skate-session-beginner';

UPDATE sports_resources
SET reservation_mode = 'shared-session',
    capacity = 12,
    kind = 'activity',
    is_active = 1,
    sort_order = 80,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'sports-resource-skate-session-open';

UPDATE sports_resources
SET reservation_mode = 'shared-session',
    capacity = 12,
    kind = 'activity',
    is_active = 1,
    sort_order = 90,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'sports-resource-skate-session-sunset';
