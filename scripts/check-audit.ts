import { spawnSync } from 'node:child_process';

import {
  evaluateAuditPolicy,
  REVIEWED_AUDIT_BASELINE,
  type VulnerabilityCounts,
} from './lib/audit-policy';

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('npm_execpath is unavailable; run this check through npm.');

const result = spawnSync(process.execPath, [npmCli, 'audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

if (result.error) throw result.error;

let report: { metadata?: { vulnerabilities?: Partial<VulnerabilityCounts> } };
try {
  report = JSON.parse(result.stdout);
} catch {
  throw new Error(`npm audit did not return JSON: ${result.stderr.trim()}`);
}

const vulnerabilities = report.metadata?.vulnerabilities;
if (!vulnerabilities) throw new Error('npm audit report has no vulnerability totals.');

const counts: VulnerabilityCounts = {
  critical: vulnerabilities.critical ?? 0,
  high: vulnerabilities.high ?? 0,
  moderate: vulnerabilities.moderate ?? 0,
  low: vulnerabilities.low ?? 0,
};
const errors = evaluateAuditPolicy(counts);

console.log('Production dependency audit policy');
console.log(`  reviewed maximum: ${JSON.stringify(REVIEWED_AUDIT_BASELINE)}`);
console.log(`  current findings: ${JSON.stringify(counts)}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exitCode = 1;
} else {
  console.log('Audit findings did not increase above the reviewed baseline.');
}
