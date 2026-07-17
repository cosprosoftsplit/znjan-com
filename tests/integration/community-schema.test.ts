import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createPreGoogleOAuthUsersTable,
  resetCommunityDatabase,
  wrapDatabase,
} from '../helpers/community-db';

async function loadEnsureCommunitySchema() {
  vi.resetModules();
  return (await import('../../src/lib/community-schema')).ensureCommunitySchema;
}

describe('ensureCommunitySchema', () => {
  beforeEach(async () => {
    await resetCommunityDatabase(env.DB);
  });

  it('upgrades a pre-Google-OAuth users table before creating its index', async () => {
    await createPreGoogleOAuthUsersTable(env.DB);
    const ensureCommunitySchema = await loadEnsureCommunitySchema();

    await expect(ensureCommunitySchema(env.DB)).resolves.toBeUndefined();

    const columns = await env.DB.prepare('PRAGMA table_info(users)').all<{ name: string }>();
    const indexes = await env.DB.prepare('PRAGMA index_list(users)').all<{ name: string }>();

    expect(columns.results.map((column) => column.name)).toContain('google_id');
    expect(indexes.results.map((index) => index.name)).toContain('idx_users_google_id');
  });

  it('never deletes duplicate production records during request-time initialization', async () => {
    const ensureCommunitySchema = await loadEnsureCommunitySchema();
    await ensureCommunitySchema(env.DB);

    await env.DB.prepare('DROP INDEX IF EXISTS idx_responses_unique_join').run();
    await env.DB.prepare('DROP INDEX IF EXISTS idx_point_transactions_unique_action_reference').run();
    await env.DB.prepare(
      `INSERT INTO users (id, email, display_name, created_at, updated_at)
       VALUES ('user-1', 'user@example.com', 'Test User', '2026-07-15T00:00:00Z', '2026-07-15T00:00:00Z')`,
    ).run();
    await env.DB.prepare(
      `INSERT INTO posts (id, user_id, type, category, title, body, status, created_at, updated_at)
       VALUES ('post-1', 'user-1', 'meetup', 'sports', 'Test post', 'Test post body', 'approved', '2026-07-15T00:00:00Z', '2026-07-15T00:00:00Z')`,
    ).run();
    await env.DB.prepare(
      `INSERT INTO responses (id, post_id, user_id, type, created_at) VALUES
       ('response-1', 'post-1', 'user-1', 'join', '2026-07-15T00:00:00Z'),
       ('response-2', 'post-1', 'user-1', 'join', '2026-07-15T00:00:01Z')`,
    ).run();
    await env.DB.prepare(
      `INSERT INTO point_transactions (id, user_id, action, points, reference_id, created_at) VALUES
       ('points-1', 'user-1', 'join', 5, 'post-1', '2026-07-15T00:00:00Z'),
       ('points-2', 'user-1', 'join', 5, 'post-1', '2026-07-15T00:00:01Z')`,
    ).run();

    const reloadedEnsureCommunitySchema = await loadEnsureCommunitySchema();
    await expect(reloadedEnsureCommunitySchema(env.DB)).resolves.toBeUndefined();

    const responseCount = await env.DB
      .prepare('SELECT COUNT(*) AS count FROM responses')
      .first<{ count: number }>();
    const transactionCount = await env.DB
      .prepare('SELECT COUNT(*) AS count FROM point_transactions')
      .first<{ count: number }>();

    expect(responseCount?.count).toBe(2);
    expect(transactionCount?.count).toBe(2);
  });

  it('deduplicates concurrent initialization for the same database', async () => {
    const ensureCommunitySchema = await loadEnsureCommunitySchema();
    const db = wrapDatabase(env.DB);

    await Promise.all([
      ensureCommunitySchema(db),
      ensureCommunitySchema(db),
      ensureCommunitySchema(db),
    ]);

    const usersTable = await env.DB
      .prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'users'")
      .first<{ name: string }>();
    expect(usersTable?.name).toBe('users');
  });

  it('tracks initialization independently for different database bindings', async () => {
    const ensureCommunitySchema = await loadEnsureCommunitySchema();
    const firstBinding = wrapDatabase(env.DB);
    const secondBinding = wrapDatabase(env.DB);

    await ensureCommunitySchema(firstBinding);
    await resetCommunityDatabase(env.DB);
    await ensureCommunitySchema(secondBinding);

    const usersTable = await env.DB
      .prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'users'")
      .first<{ name: string }>();
    expect(usersTable?.name).toBe('users');
  });

  it('allows a retry after an initialization failure', async () => {
    const ensureCommunitySchema = await loadEnsureCommunitySchema();
    let failNextPrepare = true;
    const db = wrapDatabase(env.DB);
    const flakyDb = {
      ...db,
      prepare(query: string) {
        if (failNextPrepare) {
          failNextPrepare = false;
          throw new Error('transient D1 failure');
        }
        return db.prepare(query);
      },
    };

    await expect(ensureCommunitySchema(flakyDb)).rejects.toThrow('transient D1 failure');
    await expect(ensureCommunitySchema(flakyDb)).resolves.toBeUndefined();
  });
});
