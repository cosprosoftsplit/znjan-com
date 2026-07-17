import { describe, expect, it } from 'vitest';

import { evaluateAuditPolicy } from '../../scripts/lib/audit-policy';

describe('dependency audit policy', () => {
  it('accepts the reviewed baseline or an improvement', () => {
    expect(evaluateAuditPolicy({ critical: 0, high: 10, moderate: 5, low: 3 })).toEqual([]);
  });

  it('rejects a new critical finding or growth above the reviewed baseline', () => {
    expect(evaluateAuditPolicy({ critical: 1, high: 12, moderate: 5, low: 3 }))
      .toEqual(expect.arrayContaining([
        expect.stringContaining('critical'),
        expect.stringContaining('high'),
      ]));
  });
});
