import { resolve } from 'node:path';

import { loadBuiltDocuments, printOutputReport } from './lib/built-output';
import { analyzeDocumentLinks } from './lib/output-integrity';

const documents = loadBuiltDocuments(resolve('dist'));
const issues = documents.flatMap(({ html, context }) => analyzeDocumentLinks(html, context));

printOutputReport(`Built-output link check (${documents.length} documents)`, issues);
if (issues.some((item) => item.severity === 'error')) process.exitCode = 1;
