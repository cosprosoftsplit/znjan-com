/**
 * GET /api/health — Diagnostic endpoint to verify D1 binding and runtime
 */
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const checks: Record<string, string> = {};

  // Check runtime
  checks.runtime = locals.runtime ? 'ok' : 'MISSING';

  // Check env
  if (locals.runtime) {
    checks.env = locals.runtime.env ? 'ok' : 'MISSING';
  }

  // Check DB binding
  if (locals.runtime?.env) {
    const env = locals.runtime.env as Record<string, unknown>;
    checks.db_binding = env.DB ? 'ok' : 'MISSING';

    // List available bindings (names only)
    checks.available_bindings = Object.keys(env)
      .filter((k) => k !== 'ASSETS')
      .join(', ') || '(none)';

    // Try a simple query
    if (env.DB) {
      try {
        const db = env.DB as { prepare: (q: string) => { first: <T>() => Promise<T> } };
        const result = await db.prepare('SELECT 1 as ok').first<{ ok: number }>();
        checks.db_query = result?.ok === 1 ? 'ok' : 'unexpected result';
      } catch (err) {
        checks.db_query = `FAILED: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
  }

  return new Response(JSON.stringify(checks, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
