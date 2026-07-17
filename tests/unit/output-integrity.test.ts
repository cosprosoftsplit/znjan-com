import { describe, expect, it } from 'vitest';

import {
  analyzeDocumentLinks,
  analyzeDocumentSeo,
  type OutputCheckContext,
} from '../../scripts/lib/output-integrity';

const context: OutputCheckContext = {
  file: 'dist/en/index.html',
  route: '/en/',
  siteOrigin: 'https://znjan.com',
  knownRoutes: new Set(['/en/', '/en/guides/']),
  runtimeRoutePatterns: [/^\/api\//],
};

const validDocument = `<!doctype html>
<html lang="en">
  <head>
    <title>Znjan Beach guide</title>
    <meta name="description" content="Plan a visit to Znjan Beach in Split with practical, current local guidance.">
    <link rel="canonical" href="https://znjan.com/en/">
    <link rel="alternate" hreflang="en" href="https://znjan.com/en/">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>
  </head>
  <body>
    <h1>Znjan Beach</h1>
    <a href="/en/guides/">Guides</a>
  </body>
</html>`;

describe('built-output integrity analysis', () => {
  it('accepts a valid same-origin document', () => {
    expect(analyzeDocumentLinks(validDocument, context)).toEqual([]);
    expect(analyzeDocumentSeo(validDocument, context).filter((issue) => issue.severity === 'error'))
      .toEqual([]);
  });

  it('reports internal targets that are absent from the generated output', () => {
    const html = validDocument.replace('/en/guides/', '/hr/vodici/ne-postoji/');

    expect(analyzeDocumentLinks(html, context)).toContainEqual(
      expect.objectContaining({ code: 'broken-internal-link' }),
    );
  });

  it('reports duplicate IDs, including duplicate search controls', () => {
    const html = validDocument.replace(
      '</body>',
      '<button id="search-modal">Search</button><div id="search-modal"></div></body>',
    );

    expect(analyzeDocumentLinks(html, context)).toContainEqual(
      expect.objectContaining({ code: 'duplicate-id' }),
    );
  });

  it('reports malformed JSON-LD', () => {
    const html = validDocument.replace(
      '{"@context":"https://schema.org","@type":"WebPage"}',
      '{"@context":"https://schema.org",}',
    );

    expect(analyzeDocumentSeo(html, context)).toContainEqual(
      expect.objectContaining({ code: 'invalid-json-ld', severity: 'error' }),
    );
  });

  it('reports hreflang targets that are absent from generated output', () => {
    const html = validDocument.replace(
      '<link rel="alternate" hreflang="en" href="https://znjan.com/en/">',
      '<link rel="alternate" hreflang="fr" href="https://znjan.com/fr/missing/">',
    );

    expect(analyzeDocumentSeo(html, context)).toContainEqual(
      expect.objectContaining({ code: 'broken-hreflang', severity: 'error' }),
    );
  });

  it('reports missing canonical, language, description, and H1 metadata', () => {
    const html = '<!doctype html><html><head><title>Incomplete</title></head><body></body></html>';
    const codes = analyzeDocumentSeo(html, context).map((issue) => issue.code);

    expect(codes).toEqual(expect.arrayContaining([
      'missing-html-lang',
      'missing-description',
      'missing-canonical',
      'missing-h1',
    ]));
  });
});
