import { readdirSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

import type { OutputCheckContext, OutputIssue } from './output-integrity';

export const SITE_ORIGIN = 'https://znjan.com';

export const RUNTIME_ROUTE_PATTERNS: readonly RegExp[] = [
  /^\/api\//,
  /^\/(?:en|hr|de|it|fr|es|pl|nl)\/play\/(?:materials\/)?$/,
  /^\/(?:en|hr|de|it|fr|es|pl|nl)\/community\/$/,
  /^\/(?:en|hr|de|it|fr|es|pl|nl)\/community\/sports\/$/,
  /^\/(?:en|hr|de|it|fr|es|pl|nl)\/community\/(?:posts|profile)\/[^/]+\/$/,
  /^\/(?:en|hr|de|it|fr|es|pl|nl)\/community\/(?:reservations|settings)\/$/,
  /^\/cdn-cgi\//,
];

export interface BuiltDocument {
  context: OutputCheckContext;
  html: string;
}

function walkFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) files.push(...walkFiles(path));
    else files.push(path);
  }
  return files;
}

function toPosixRelative(root: string, file: string): string {
  return relative(root, file).split(sep).join('/');
}

function routeFromFile(relativePath: string): string {
  if (relativePath === 'index.html') return '/';
  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`;
  }
  return `/${relativePath}`;
}

export function loadBuiltDocuments(distDirectory = resolve('dist')): BuiltDocument[] {
  const files = walkFiles(distDirectory);
  const knownRoutes = new Set(files.map((file) => routeFromFile(toPosixRelative(distDirectory, file))));
  knownRoutes.add('/');

  return files
    .filter((file) => file.endsWith('.html'))
    .map((file) => {
      const relativePath = toPosixRelative(distDirectory, file);
      return {
        context: {
          file: `dist/${relativePath}`,
          route: routeFromFile(relativePath),
          siteOrigin: SITE_ORIGIN,
          knownRoutes,
          runtimeRoutePatterns: RUNTIME_ROUTE_PATTERNS,
        },
        html: readFileSync(file, 'utf8'),
      };
    });
}

export function printOutputReport(label: string, issues: readonly OutputIssue[]): void {
  const errors = issues.filter((item) => item.severity === 'error');
  const warnings = issues.filter((item) => item.severity === 'warning');
  const limit = 100;

  console.log(`\n${label}: ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const item of issues.slice(0, limit)) {
    const marker = item.severity === 'error' ? 'ERROR' : 'WARN';
    console.log(`[${marker}] ${item.code} ${item.file}: ${item.message}`);
  }
  if (issues.length > limit) console.log(`... ${issues.length - limit} additional issue(s) omitted.`);
}
