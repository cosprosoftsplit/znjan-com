import type { D1Database } from './db';

let communitySchemaPromise: Promise<void> | null = null;

const COMMUNITY_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    locale TEXT DEFAULT 'en',
    bio TEXT,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    role TEXT DEFAULT 'user',
    google_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS magic_links (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    lang TEXT DEFAULT 'en',
    location TEXT,
    lat REAL,
    lng REAL,
    event_date TEXT,
    event_time TEXT,
    max_participants INTEGER,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    views INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    body TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS point_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    points INTEGER NOT NULL,
    reference_id TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_badges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    badge_id TEXT NOT NULL,
    earned_at TEXT NOT NULL,
    UNIQUE(user_id, badge_id)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)',
  'CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token)',
  'CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email)',
  'CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)',
  'CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type)',
  'CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_responses_post ON responses(post_id)',
  'CREATE INDEX IF NOT EXISTS idx_responses_user ON responses(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
];

const COMMUNITY_CONSTRAINT_STATEMENTS = [
  `DELETE FROM responses
   WHERE type = 'join'
     AND id NOT IN (
       SELECT MIN(id)
       FROM responses
       WHERE type = 'join'
       GROUP BY post_id, user_id, type
     )`,
  `DELETE FROM point_transactions
   WHERE reference_id IS NOT NULL
     AND id NOT IN (
       SELECT MIN(id)
       FROM point_transactions
       WHERE reference_id IS NOT NULL
       GROUP BY user_id, action, reference_id
     )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_unique_join
   ON responses(post_id, user_id, type)
   WHERE type = 'join'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_point_transactions_unique_action_reference
   ON point_transactions(user_id, action, reference_id)
   WHERE reference_id IS NOT NULL`,
];

async function addGoogleIdColumnIfMissing(db: D1Database): Promise<void> {
  const columns = await db.prepare('PRAGMA table_info(users)').all<{ name: string }>();
  const hasGoogleId = columns.results.some((column) => column.name === 'google_id');

  if (!hasGoogleId) {
    await db.prepare('ALTER TABLE users ADD COLUMN google_id TEXT').run();
  }
}

export async function ensureCommunitySchema(db: D1Database): Promise<void> {
  if (!communitySchemaPromise) {
    communitySchemaPromise = (async () => {
      for (const statement of COMMUNITY_SCHEMA_STATEMENTS) {
        await db.prepare(statement).run();
      }

      await addGoogleIdColumnIfMissing(db);

      for (const statement of COMMUNITY_CONSTRAINT_STATEMENTS) {
        await db.prepare(statement).run();
      }
    })().catch((error) => {
      communitySchemaPromise = null;
      throw error;
    });
  }

  await communitySchemaPromise;
}
