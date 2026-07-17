export interface VulnerabilityCounts {
  critical: number;
  high: number;
  moderate: number;
  low: number;
}

export const REVIEWED_AUDIT_BASELINE: Readonly<VulnerabilityCounts> = {
  critical: 0,
  high: 11,
  moderate: 5,
  low: 3,
};

export function evaluateAuditPolicy(
  counts: VulnerabilityCounts,
  baseline: Readonly<VulnerabilityCounts> = REVIEWED_AUDIT_BASELINE,
): string[] {
  const errors: string[] = [];
  for (const severity of ['critical', 'high', 'moderate', 'low'] as const) {
    if (counts[severity] > baseline[severity]) {
      errors.push(
        `${severity} vulnerabilities increased from the reviewed baseline `
        + `${baseline[severity]} to ${counts[severity]}.`,
      );
    }
  }
  return errors;
}
