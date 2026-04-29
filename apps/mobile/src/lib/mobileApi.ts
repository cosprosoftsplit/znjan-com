import type { MobileEnvelope, MobileErrorEnvelope } from './mobileTypes';

const DEFAULT_API_BASE_URL = 'https://znjan.com';

export class MobileApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'MobileApiError';
    this.status = status;
    this.code = code;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  return normalizeBaseUrl(envUrl || DEFAULT_API_BASE_URL);
}

export function describeApiTarget(baseUrl: string): string {
  const url = new URL(baseUrl);
  if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
    return `Local preview (${url.host})`;
  }

  if (url.hostname === 'znjan.com' || url.hostname.endsWith('.znjan.com')) {
    return 'Production backend';
  }

  return `Custom backend (${url.host})`;
}

export function resolveApiUrl(path: string): string {
  return new URL(path, `${getApiBaseUrl()}/`).toString();
}

function isMobileEnvelope<T>(value: unknown): value is MobileEnvelope<T> {
  return typeof value === 'object' && value !== null && 'data' in value && 'version' in value;
}

function isMobileErrorEnvelope(value: unknown): value is MobileErrorEnvelope {
  return typeof value === 'object' && value !== null && 'error' in value && 'version' in value;
}

export async function fetchMobileData<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveApiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const rawText = await response.text();
  const payload = rawText ? JSON.parse(rawText) as unknown : null;

  if (!response.ok) {
    if (isMobileErrorEnvelope(payload)) {
      throw new MobileApiError(payload.error.message, response.status, payload.error.code);
    }

    throw new MobileApiError(`Request failed with status ${response.status}`, response.status, 'request-failed');
  }

  if (!isMobileEnvelope<T>(payload)) {
    throw new MobileApiError('Unexpected API response shape', response.status, 'invalid-envelope');
  }

  return payload.data;
}
