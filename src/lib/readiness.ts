import type { D1Database } from './db';

const LATEST_REQUIRED_MIGRATION = '0012_pilot_support_follow_up_notes.sql';

const REQUIRED_TABLE_COLUMNS: Record<string, readonly string[]> = {
  users: ['id', 'email', 'google_id'],
  magic_links: ['id', 'token', 'expires_at'],
  sessions: ['id', 'user_id', 'expires_at'],
  posts: ['id', 'user_id', 'status'],
  responses: ['id', 'post_id', 'user_id', 'type'],
  point_transactions: ['id', 'user_id', 'reference_id'],
  user_badges: ['id', 'user_id', 'badge_id'],
  sports_resources: ['id', 'slug', 'reservation_mode'],
  sports_reservations: ['id', 'resource_id', 'reservation_date', 'cancelled_by_user_id'],
  sports_blackouts: ['id', 'blackout_date', 'is_active'],
  sports_reservation_audit_log: ['id', 'action', 'created_at'],
  sports_collision_reports: ['id', 'resource_id', 'issue_type'],
  sports_pilot_distribution_logs: ['id', 'material_type', 'quantity'],
  venue_validation_logs: ['id', 'venue_key', 'outcome'],
  sports_pilot_coverage_blocks: ['id', 'coverage_date', 'is_active'],
  pilot_support_signals: ['id', 'triage_status', 'triage_updated_at', 'follow_up_note'],
};

const REQUIRED_INDEXES_BY_TABLE: Record<string, readonly string[]> = {
  users: ['idx_users_google_id'],
  responses: ['idx_responses_unique_join'],
  point_transactions: ['idx_point_transactions_unique_action_reference'],
  sports_reservations: ['idx_sports_reservations_active_slot'],
  sports_collision_reports: ['idx_sports_collision_followup_unique'],
  sports_pilot_distribution_logs: ['idx_sports_pilot_distribution_logs_date'],
  venue_validation_logs: ['idx_venue_validation_logs_outcome'],
  sports_pilot_coverage_blocks: ['idx_sports_pilot_coverage_blocks_active_date'],
  pilot_support_signals: ['idx_pilot_support_signals_status'],
};

export async function isApplicationReady(db: D1Database): Promise<boolean> {
  const tableEntries = Object.entries(REQUIRED_TABLE_COLUMNS);
  const indexEntries = Object.entries(REQUIRED_INDEXES_BY_TABLE);
  const checks = [
    ...tableEntries.map(([table]) => db.prepare(`PRAGMA table_info("${table}")`)),
    ...indexEntries.map(([table]) => db.prepare(`PRAGMA index_list("${table}")`)),
    db
      .prepare('SELECT name FROM d1_migrations WHERE name = ? LIMIT 1')
      .bind(LATEST_REQUIRED_MIGRATION),
  ];
  const results = await db.batch<{ name: string }>(checks);

  const hasRequiredColumns = tableEntries.every(([, requiredColumns], index) => {
    const availableColumns = new Set(results[index]?.results.map((row) => row.name));
    return requiredColumns.every((column) => availableColumns.has(column));
  });

  const indexOffset = tableEntries.length;
  const hasRequiredIndexes = indexEntries.every(([, requiredIndexes], index) => {
    const availableIndexes = new Set(
      results[indexOffset + index]?.results.map((row) => row.name),
    );
    return requiredIndexes.every((requiredIndex) => availableIndexes.has(requiredIndex));
  });

  const migrationResult = results.at(-1);
  const hasRequiredMigration = migrationResult?.results.some(
    (row) => row.name === LATEST_REQUIRED_MIGRATION,
  );

  return hasRequiredColumns && hasRequiredIndexes && hasRequiredMigration === true;
}
