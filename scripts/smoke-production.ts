import { assertReadyPayload, isEnglishRedirect } from './lib/smoke-contract';

const baseUrl = (process.env.SMOKE_BASE_URL ?? 'https://znjan.com').replace(/\/$/, '');
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 15_000);

async function request(path: string, redirect: RequestRedirect = 'follow'): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    redirect,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': 'znjan-release-smoke/1.0' },
  });
}

async function expectStatus(path: string, status: number): Promise<void> {
  const response = await request(path);
  if (response.status !== status) {
    throw new Error(`${path}: expected ${status}, received ${response.status}.`);
  }
  console.log(`PASS ${status} ${path}`);
}

async function expectJson(
  path: string,
  validate: (payload: Record<string, unknown>) => boolean | void,
): Promise<void> {
  const response = await request(path);
  if (!response.ok) throw new Error(`${path}: expected success, received ${response.status}.`);
  const payload = await response.json() as Record<string, unknown>;
  if (validate(payload) === false) throw new Error(`${path}: JSON contract failed.`);
  console.log(`PASS ${response.status} ${path}`);
}

const root = await request('/', 'manual');
if (![301, 302, 307, 308].includes(root.status)
  || !isEnglishRedirect(root.headers.get('location'), baseUrl)) {
  throw new Error(`/: expected same-site redirect to /en/, received ${root.status} ${root.headers.get('location')}.`);
}
console.log(`PASS ${root.status} / -> /en/`);

const pagePaths = [
  ...['en', 'hr', 'de', 'it', 'fr', 'es', 'pl', 'nl'].map((lang) => `/${lang}/`),
  '/sitemap-index.xml',
  '/robots.txt',
  '/llms.txt',
  '/en/guides/',
  '/en/guides/complete-guide-to-znjan-beach/',
  '/en/articles/how-to-get-to-znjan-beach/',
  '/en/places/',
  '/en/places/casa-sol/',
  '/en/activities/',
  '/en/activities/swimming/',
  '/en/beach-areas/',
  '/en/beach-areas/main-beach/',
  '/en/events/',
  '/en/contact/',
  '/en/privacy/',
  '/en/community/',
  '/en/community/sports/',
];
for (const path of pagePaths) await expectStatus(path, 200);

await expectStatus('/release-smoke/this-route-must-not-exist/', 404);
await expectJson('/api/health/', (payload) => assertReadyPayload(payload));
await expectJson('/api/posts/', (payload) => Array.isArray(payload.posts));
await expectJson(
  '/api/mobile/v1/community/feed/?lang=en',
  (payload) => Array.isArray((payload.data as { posts?: unknown[] } | undefined)?.posts),
);
await expectJson('/api/reservations/', (payload) =>
  typeof payload.reservationsEnabled === 'boolean' && Array.isArray(payload.resources));
await expectJson('/api/auth/me/', (payload) => Object.hasOwn(payload, 'user'));

console.log(`Production smoke passed for ${baseUrl}.`);
