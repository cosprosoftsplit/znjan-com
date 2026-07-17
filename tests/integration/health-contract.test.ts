import { env } from 'cloudflare:workers';
import { applyD1Migrations } from 'cloudflare:test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET as healthGET } from '../../src/pages/api/health';
import { GET as mobileFeedGET } from '../../src/pages/api/mobile/v1/community/feed';
import { GET as postsGET } from '../../src/pages/api/posts/index';
import type { D1Database } from '../../src/lib/db';
import {
  createPreGoogleOAuthUsersTable,
  resetCommunityDatabase,
} from '../helpers/community-db';

function apiContext(url: string, db: D1Database = env.DB) {
  return {
    url: new URL(url),
    locals: {
      runtime: { env: { DB: db } },
      user: null,
    },
  } as never;
}

describe('runtime API contracts', () => {
  beforeEach(async () => {
    await resetCommunityDatabase(env.DB);
    vi.resetModules();
  });

  it('reports incompatible application schema as not ready', async () => {
    await createPreGoogleOAuthUsersTable(env.DB);

    const response = await healthGET(apiContext('https://znjan.com/api/health/'));
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(503);
    expect(body).toEqual({ status: 'not-ready' });
  });

  it('reports a missing database binding without exposing runtime details', async () => {
    const response = await healthGET({
      locals: { runtime: { env: {} } },
    } as never);
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(503);
    expect(body).toEqual({ status: 'not-ready' });
  });

  it('reports a fully migrated application schema as ready', async () => {
    await applyD1Migrations(env.DB as never, env.TEST_MIGRATIONS);

    const response = await healthGET(apiContext('https://znjan.com/api/health/'));
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ready' });
  });

  it('returns successful web and mobile feed envelopes for a compatible schema', async () => {
    await applyD1Migrations(env.DB as never, env.TEST_MIGRATIONS);

    const webResponse = await postsGET(apiContext('https://znjan.com/api/posts/'));
    const webBody = await webResponse.json() as { posts?: unknown[]; total?: number };
    expect(webResponse.status).toBe(200);
    expect(webBody).toMatchObject({ posts: [], total: 0 });

    const mobileResponse = await mobileFeedGET(
      apiContext('https://znjan.com/api/mobile/v1/community/feed/?lang=en'),
    );
    const mobileBody = await mobileResponse.json() as Record<string, unknown>;
    expect(mobileResponse.status).toBe(200);
    expect(mobileBody).toHaveProperty('data.posts', []);
  });

  it('does not expose raw database errors from the public posts endpoint', async () => {
    const failingDb = {
      prepare() {
        throw new Error('secret database topology');
      },
    } as unknown as D1Database;

    const response = await postsGET(apiContext('https://znjan.com/api/posts/', failingDb));
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Internal server error' });
  });
});
