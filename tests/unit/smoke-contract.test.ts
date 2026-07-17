import { describe, expect, it } from 'vitest';

import { assertReadyPayload, isEnglishRedirect } from '../../scripts/lib/smoke-contract';

describe('production smoke contracts', () => {
  it('accepts only the minimal public readiness payload', () => {
    expect(() => assertReadyPayload({ status: 'ready' })).not.toThrow();
    expect(() => assertReadyPayload({ status: 'ready', bindings: ['DB'] })).toThrow();
    expect(() => assertReadyPayload({ status: 'not-ready' })).toThrow();
  });

  it('recognizes an English homepage redirect on the same deployment', () => {
    expect(isEnglishRedirect('https://znjan.com/en/', 'https://znjan.com')).toBe(true);
    expect(isEnglishRedirect('/en/', 'https://znjan.com')).toBe(true);
    expect(isEnglishRedirect('https://example.com/en/', 'https://znjan.com')).toBe(false);
  });
});
