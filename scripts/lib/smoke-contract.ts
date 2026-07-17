export function assertReadyPayload(payload: unknown): void {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Readiness response is not an object.');
  }
  const record = payload as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 1 || keys[0] !== 'status' || record.status !== 'ready') {
    throw new Error('Readiness response must be exactly {"status":"ready"}.');
  }
}

export function isEnglishRedirect(location: string | null, baseUrl: string): boolean {
  if (!location) return false;
  try {
    const base = new URL(baseUrl);
    const target = new URL(location, base);
    const normalizeHost = (hostname: string) => hostname.replace(/^www\./, '');
    return normalizeHost(target.hostname) === normalizeHost(base.hostname)
      && target.pathname === '/en/';
  } catch {
    return false;
  }
}
