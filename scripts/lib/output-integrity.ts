export type OutputIssueSeverity = 'error' | 'warning';

export interface OutputIssue {
  code: string;
  file: string;
  message: string;
  severity: OutputIssueSeverity;
}

export interface OutputCheckContext {
  file: string;
  route: string;
  siteOrigin: string;
  knownRoutes: ReadonlySet<string>;
  runtimeRoutePatterns?: readonly RegExp[];
}

type Attributes = Record<string, string>;

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
};

function decodeHtml(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    const normalized = key.toLowerCase();
    if (normalized.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
    }
    if (normalized.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
    }
    return HTML_ENTITIES[normalized] ?? entity;
  });
}

function stripHtml(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function parseAttributes(tag: string): Attributes {
  const attributes: Attributes = {};
  const body = tag.replace(/^<\/?[\w:-]+\s*/i, '').replace(/\/?\s*>$/, '');
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of body.matchAll(pattern)) {
    const name = match[1]?.toLowerCase();
    if (!name) continue;
    attributes[name] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  }

  return attributes;
}

function openingTags(html: string, tagName?: string): string[] {
  const name = tagName ? tagName.replace(/[^a-z0-9:-]/gi, '') : '[a-z][\\w:-]*';
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
}

function issue(
  context: OutputCheckContext,
  code: string,
  message: string,
  severity: OutputIssueSeverity = 'error',
): OutputIssue {
  return { code, file: context.file, message, severity };
}

function normalizePath(pathname: string): string {
  const collapsed = pathname.replace(/\/{2,}/g, '/');
  if (collapsed === '/') return collapsed;
  return collapsed.endsWith('/') || /\.[a-z0-9]+$/i.test(collapsed)
    ? collapsed
    : `${collapsed}/`;
}

function sameSiteHost(left: string, right: string): boolean {
  return left.replace(/^www\./, '') === right.replace(/^www\./, '');
}

function routeExists(pathname: string, context: OutputCheckContext): boolean {
  const normalized = normalizePath(pathname);
  if (context.knownRoutes.has(normalized) || context.knownRoutes.has(pathname)) return true;
  return context.runtimeRoutePatterns?.some((pattern) => pattern.test(normalized)) ?? false;
}

export function analyzeDocumentLinks(
  html: string,
  context: OutputCheckContext,
): OutputIssue[] {
  const issues: OutputIssue[] = [];
  const ids = new Map<string, number>();
  const markup = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  for (const tag of openingTags(markup)) {
    const id = parseAttributes(tag).id;
    if (id) ids.set(id, (ids.get(id) ?? 0) + 1);
  }

  for (const [id, count] of ids) {
    if (count > 1) {
      issues.push(issue(context, 'duplicate-id', `ID "${id}" occurs ${count} times.`));
    }
  }

  const baseUrl = new URL(context.route, context.siteOrigin);
  const siteUrl = new URL(context.siteOrigin);

  for (const tag of openingTags(markup, 'a')) {
    const href = parseAttributes(tag).href?.trim();
    if (!href || href.startsWith('#') || /^(mailto|tel):/i.test(href)) continue;
    if (/^(javascript|data):/i.test(href)) {
      issues.push(issue(context, 'unsafe-link', `Unsafe link protocol in "${href}".`));
      continue;
    }

    let target: URL;
    try {
      target = new URL(href, baseUrl);
    } catch {
      issues.push(issue(context, 'malformed-link', `Malformed link target "${href}".`));
      continue;
    }

    if (!sameSiteHost(target.hostname, siteUrl.hostname)) continue;
    if (!routeExists(target.pathname, context)) {
      issues.push(
        issue(context, 'broken-internal-link', `Internal target "${target.pathname}" was not built.`),
      );
    }
  }

  return issues;
}

export function analyzeDocumentSeo(
  html: string,
  context: OutputCheckContext,
): OutputIssue[] {
  const issues: OutputIssue[] = [];
  const htmlTag = openingTags(html, 'html')[0];
  const lang = htmlTag ? parseAttributes(htmlTag).lang?.trim() : undefined;
  if (!lang) issues.push(issue(context, 'missing-html-lang', 'The html element has no lang value.'));

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripHtml(titleMatch[1] ?? '') : '';
  if (!title) {
    issues.push(issue(context, 'missing-title', 'The document has no non-empty title.'));
  } else if (title.length < 20 || title.length > 65) {
    issues.push(
      issue(
        context,
        'title-length',
        `Title length is ${title.length}; review the recommended 20–65 character range.`,
        'warning',
      ),
    );
  }

  const metaTags = openingTags(html, 'meta').map(parseAttributes);
  const description = metaTags.find((attrs) => attrs.name?.toLowerCase() === 'description')
    ?.content?.trim();
  if (!description) {
    issues.push(issue(context, 'missing-description', 'The document has no meta description.'));
  } else if (description.length < 70 || description.length > 170) {
    issues.push(
      issue(
        context,
        'description-length',
        `Description length is ${description.length}; review the recommended 70–170 character range.`,
        'warning',
      ),
    );
  }

  const linkTags = openingTags(html, 'link').map(parseAttributes);
  const canonicals = linkTags.filter((attrs) =>
    attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'));
  if (canonicals.length === 0) {
    issues.push(issue(context, 'missing-canonical', 'The document has no canonical link.'));
  } else if (canonicals.length > 1) {
    issues.push(issue(context, 'duplicate-canonical', 'The document has multiple canonical links.'));
  } else {
    const href = canonicals[0]?.href;
    try {
      const canonical = new URL(href ?? '');
      const expectedHost = new URL(context.siteOrigin).hostname;
      if (!sameSiteHost(canonical.hostname, expectedHost)) {
        issues.push(issue(context, 'external-canonical', `Canonical points to ${canonical.hostname}.`));
      }
    } catch {
      issues.push(issue(context, 'invalid-canonical', `Canonical "${href ?? ''}" is not absolute.`));
    }
  }

  const h1Count = html.match(/<h1\b[^>]*>/gi)?.length ?? 0;
  if (h1Count === 0) {
    issues.push(issue(context, 'missing-h1', 'The document has no H1.'));
  } else if (h1Count > 1) {
    issues.push(issue(context, 'multiple-h1', `The document contains ${h1Count} H1 elements.`));
  }

  const alternateLanguages = new Set<string>();
  for (const alternate of linkTags.filter((attrs) =>
    attrs.rel?.toLowerCase().split(/\s+/).includes('alternate') && attrs.hreflang)) {
    const hreflang = alternate.hreflang.toLowerCase();
    if (alternateLanguages.has(hreflang)) {
      issues.push(issue(context, 'duplicate-hreflang', `Duplicate hreflang "${hreflang}".`));
    }
    alternateLanguages.add(hreflang);
    if (!alternate.href) {
      issues.push(issue(context, 'missing-hreflang-href', `hreflang "${hreflang}" has no href.`));
      continue;
    }
    try {
      const target = new URL(alternate.href, context.siteOrigin);
      const site = new URL(context.siteOrigin);
      if (sameSiteHost(target.hostname, site.hostname) && !routeExists(target.pathname, context)) {
        issues.push(
          issue(
            context,
            'broken-hreflang',
            `hreflang "${hreflang}" points to unbuilt target "${target.pathname}".`,
          ),
        );
      }
    } catch {
      issues.push(
        issue(context, 'invalid-hreflang', `hreflang "${hreflang}" has an invalid href.`),
      );
    }
  }

  const jsonLdPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(jsonLdPattern)) {
    const attrs = parseAttributes(`<script ${match[1] ?? ''}>`);
    if (attrs.type?.toLowerCase() !== 'application/ld+json') continue;
    try {
      JSON.parse((match[2] ?? '').trim());
    } catch {
      issues.push(issue(context, 'invalid-json-ld', 'A JSON-LD script is not valid JSON.'));
    }
  }

  return issues;
}
