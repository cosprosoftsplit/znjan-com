/// <reference types="@cloudflare/vitest-pool-workers/types" />

type TestD1Database = import('../src/lib/db').D1Database;
type TestD1Migration = import('@cloudflare/vitest-pool-workers').D1Migration;

declare module 'cloudflare:workers' {
  interface ProvidedEnv {
    DB: TestD1Database;
    TEST_MIGRATIONS: TestD1Migration[];
  }

  export const env: ProvidedEnv;
}
