import type { D1Database } from '../../src/lib/db';

const COMMUNITY_TABLES_IN_DROP_ORDER = [
  'd1_migrations',
  'sports_collision_reports',
  'sports_reservation_audit_log',
  'sports_reservations',
  'sports_blackouts',
  'sports_resources',
  'pilot_support_signals',
  'sports_pilot_coverage_blocks',
  'venue_validation_logs',
  'sports_pilot_distribution_logs',
  'user_badges',
  'point_transactions',
  'responses',
  'posts',
  'sessions',
  'magic_links',
  'users',
] as const;

export async function resetCommunityDatabase(db: D1Database): Promise<void> {
  for (const table of COMMUNITY_TABLES_IN_DROP_ORDER) {
    await db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
  }
}

export async function createPreGoogleOAuthUsersTable(db: D1Database): Promise<void> {
  await db.prepare(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    locale TEXT DEFAULT 'en',
    bio TEXT,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    role TEXT DEFAULT 'user',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
}

export function wrapDatabase(db: D1Database): D1Database {
  return {
    prepare: (query) => db.prepare(query),
    batch: (statements) => db.batch(statements),
    exec: (query) => db.exec(query),
  };
}
