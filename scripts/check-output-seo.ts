import { resolve } from 'node:path';

import { loadBuiltDocuments, printOutputReport } from './lib/built-output';
import { analyzeDocumentSeo } from './lib/output-integrity';

const documents = loadBuiltDocuments(resolve('dist'))
  .filter(({ context }) => context.route !== '/404.html');
const issues = documents.flatMap(({ html, context }) => analyzeDocumentSeo(html, context));

printOutputReport(`Built-output SEO check (${documents.length} documents)`, issues);
if (issues.some((item) => item.severity === 'error')) process.exitCode = 1;
