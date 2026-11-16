import { execSync } from 'node:child_process';

import { publications } from '../src/data/publications.js';
import { webProjects } from '../src/data/webProjects.js';
import { jsonLd, robotsTxt, sitemapXml, snapshotHtml } from './render.js';

const EMPTY_ROOT = '<div id="root"></div>';
const JSON_LD_SLOT = '<!-- seo:json-ld -->';

/** Date of the last commit, so the sitemap's lastmod changes only when the site does. */
function lastCommitDate() {
  try {
    return execSync('git log -1 --format=%cs', { encoding: 'utf8' }).trim();
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** Makes the page readable without JavaScript, and tells crawlers where to look. */
export function seo() {
  const data = { publications, webProjects };
  return {
    name: 'seo',
    transformIndexHtml(html) {
      const script = `<script type="application/ld+json">${JSON.stringify(jsonLd(data))}</script>`;
      return html
        .replace(JSON_LD_SLOT, script)
        .replace(EMPTY_ROOT, `<div id="root">${snapshotHtml(data)}</div>`);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt(),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapXml(lastCommitDate()),
      });
    },
  };
}
