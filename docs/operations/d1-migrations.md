# D1 migration and recovery runbook

This runbook covers the `znjan-community` production database bound as `DB` in `wrangler.toml`. Schema changes must be rehearsed against a production export before they are applied remotely.

## Health model

- **Liveness** means the Worker can answer an HTTP request.
- **Readiness** means the `DB` binding is available and the application-critical tables and columns match the deployed code.
- A successful `SELECT 1` proves connectivity only. It does not prove application readiness.

The public `/api/health/` endpoint must return `200` only when readiness passes and `503` otherwise. Its response must not include binding names, account details, SQL, or raw D1 errors.

## 2026-07-15 community-feed incident

Observed production behavior before remediation:

- `/api/posts/` returned `500` with `D1_ERROR: no such column: google_id`.
- `/api/mobile/v1/community/feed/` returned `503`.
- `/api/health/` returned `200` because it checked only `SELECT 1`.

Root cause:

1. The production database was created partly by request-time `CREATE TABLE IF NOT EXISTS` code instead of Wrangler's migration ledger.
2. The `users` table matched `0001_initial.sql` and did not contain `google_id` from `0002_google_oauth.sql`.
3. Request-time initialization tried to create `idx_users_google_id` before its compatibility repair added the missing column.
4. Running `wrangler d1 migrations list` created an empty `d1_migrations` ledger, so Wrangler considered all migrations from 0001 through 0012 pending even though most corresponding objects already existed.

## Verified pre-change recovery points

- SQL export: `C:\Users\ivanb\znjan.com-backups\d1\znjan-community-20260715-181239.sql`
- Size: 11,128 bytes
- SHA-256: `170FEAD8B8E8AEE2EF9E59876FD492DFD2E7ECBBA9F4B470668E1954FAF0E544`
- Export verification: 15 `CREATE TABLE` statements and 15 `INSERT` statements parsed successfully.
- Pre-change Time Travel bookmark: `000000df-00000000-000050a9-5fcd3358ceebf9756b25f5197d667ea4`

Keep the export outside the repository until post-deployment checks and a later backup both pass.

## Observed pre-change schema

The database contained the community tables from migration 0001 and the sports objects corresponding to migrations 0004–0007 and 0009. It did not contain:

- `users.google_id` or `idx_users_google_id` (0002)
- the two uniqueness indexes from 0003
- `venue_validation_logs` and its indexes (0008)
- `pilot_support_signals` and its columns/indexes (0010–0012)

Duplicate checks for join responses and action/reference point transactions both returned zero duplicate groups.

Pre-change row counts that must be preserved:

| Table | Rows |
|---|---:|
| users | 1 |
| magic_links | 1 |
| sessions | 1 |
| posts | 1 |
| responses | 0 |
| point_transactions | 2 |
| user_badges | 0 |
| sports_resources | 9 |
| sports_reservations | 0 |
| all other existing sports tables | 0 |

## Rehearsed forward fix

The verified export was imported into an isolated local D1 store. The following historical migrations were then executed directly, in order:

1. `0002_google_oauth.sql`
2. `0003_community_constraints.sql`
3. `0008_venue_validation_logs.sql`
4. `0010_pilot_support_signals.sql`
5. `0011_pilot_support_triage.sql`
6. `0012_pilot_support_follow_up_notes.sql`

Afterward, migrations 0001–0012 were inserted into the migration ledger only after schema validation proved that their objects were present. The reconciled production copy and a clean database migrated from 0001 through 0012 both contained 53 application schema objects with zero missing, unexpected, or definition-mismatched objects. Miniflare's local-only `_cf_METADATA` table is excluded from this count. All pre-change row counts were preserved, and Wrangler reported no pending migrations.

Do not run a normal `wrangler d1 migrations apply --remote` against the pre-remediation database: 0001 would collide with existing tables.

## Authentication note

The machine-level `CLOUDFLARE_API_TOKEN` available during this incident did not have access to this D1 database. The authenticated Wrangler OAuth session did. For this operation only, commands were run in a process scope with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` unset. Never print or commit token values.

## Apply procedure

1. Capture a fresh export and Time Travel bookmark.
2. Re-run duplicate-group checks and row counts.
3. Execute only the six missing migration files listed above with `wrangler d1 execute znjan-community --remote --file <file>`.
4. Compare the remote schema to a clean 0001–0012 fixture.
5. Insert the 12 historical filenames into `d1_migrations` with `INSERT OR IGNORE` only after the comparison passes.
6. Confirm `wrangler d1 migrations list znjan-community --remote` reports no pending migrations.
7. Recheck row counts and the web/mobile community endpoints.

## Restore procedure

If schema validation or row-count checks fail, stop application writes and restore the database to the recorded pre-change bookmark:

```powershell
npx.cmd wrangler d1 time-travel restore znjan-community --bookmark=000000df-00000000-000050a9-5fcd3358ceebf9756b25f5197d667ea4
```

Time Travel restoration overwrites the database in place and cancels in-flight queries, so use it only for a confirmed failed migration. Keep the exported SQL as a second recovery artifact and verify its SHA-256 before any import.

## Routine migration workflow after reconciliation

1. Create a new numbered migration; never edit an already-applied historical file.
2. Apply it to a clean local D1 database.
3. Apply it to a copy of the latest production export.
4. Validate schema, indexes, and before/after row counts.
5. Export production and capture a Time Travel bookmark.
6. Apply with Wrangler remotely.
7. Verify readiness and the affected user journeys.

## 2026-07-15 execution result

The rehearsed sequence was applied successfully to production:

- All six missing migration files completed.
- The remote schema matched all 53 expected application table/index definitions.
- The migration ledger contains 12 entries and Wrangler reports no pending migrations.
- Every pre-change row count was preserved exactly.
- `/api/posts/`, the mobile community feed, auth/me, leaderboard, and the public sports schedule all returned `200` immediately afterward.
- Post-change Time Travel bookmark: `000000e0-00000000-000050a9-59f0a4a46cce54be9633e1a1e9b0a8f5`.

The application-aware readiness endpoint and non-destructive request-time initialization are implemented on branch `codex/phase-0-community-recovery`; they take effect after that branch is reviewed and deployed.
