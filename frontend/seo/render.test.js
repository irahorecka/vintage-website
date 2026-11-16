import { describe, expect, it } from 'vitest';

import { jsonLd, sitemapXml, snapshotHtml } from './render.js';

const publications = [
  {
    authors: 'Doe, J. & <Roe>',
    year: '2026',
    title: 'A "quoted" title',
    venue: 'Journal',
    doi: '10.1/x',
    url: 'https://doi.org/10.1/x',
  },
];
const webProjects = [
  { title: 'Site', description: 'd', url: 'https://a.test', stack: ['React'] },
];
const data = { publications, webProjects };

describe('snapshotHtml', () => {
  it('has a single h1 and escapes data', () => {
    const html = snapshotHtml(data);
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain('&lt;Roe&gt;');
    expect(html).toContain('A &quot;quoted&quot; title');
  });
});

describe('jsonLd', () => {
  it('describes the person and each publication', () => {
    const types = jsonLd(data)['@graph'].map((node) => node['@type']);
    expect(types).toEqual(['Person', 'WebSite', 'ScholarlyArticle']);
  });

  it('keeps contact details out', () => {
    expect(JSON.stringify(jsonLd(data))).not.toMatch(/email|telephone/);
  });
});

describe('sitemapXml', () => {
  it('lists the site with its last modification date', () => {
    expect(sitemapXml('2026-11-16')).toContain('<lastmod>2026-11-16</lastmod>');
  });
});
