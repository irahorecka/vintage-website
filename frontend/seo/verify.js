// Fails the build when the built page would be unreadable to a crawler.
import { readFileSync } from 'node:fs';
import process from 'node:process';

const dist = new URL('../dist/', import.meta.url);
const read = (name) => readFileSync(new URL(name, dist), 'utf8');

const html = read('index.html');
const count = (pattern) => (html.match(pattern) ?? []).length;

const checks = [
  ['exactly one <h1> in the HTML source', count(/<h1[ >]/g) === 1],
  ['a <title>', count(/<title>[^<]+<\/title>/g) === 1],
  ['a meta description', count(/<meta\s+name="description"/g) === 1],
  ['a canonical link', count(/<link rel="canonical"/g) === 1],
  ['JSON-LD that parses', jsonLdParses(html)],
  ['og-image.png', exists('og-image.png')],
  ['robots.txt naming the sitemap', read('robots.txt').includes('Sitemap:')],
  [
    'sitemap.xml with a valid lastmod date',
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(read('sitemap.xml')),
  ],
];

function jsonLdParses(source) {
  const match = source.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/s
  );
  try {
    return JSON.parse(match[1])['@graph'].length > 0;
  } catch {
    return false;
  }
}

function exists(name) {
  try {
    readFileSync(new URL(name, dist));
    return true;
  } catch {
    return false;
  }
}

const failed = checks.filter(([, ok]) => !ok).map(([what]) => what);
if (failed.length) {
  console.error(`SEO check failed. Missing: ${failed.join('; ')}`);
  process.exit(1);
}
console.log(`SEO check passed (${checks.length} checks).`);
