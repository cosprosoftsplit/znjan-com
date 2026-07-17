import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      wrangler: {
        configPath: './wrangler.toml',
      },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(path.join(import.meta.dirname, 'migrations')),
        },
      },
    })),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'astro:content': fileURLToPath(new URL('./tests/stubs/astro-content.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 10_000,
  },
});
