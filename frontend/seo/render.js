// Pure functions: site data in, crawlable text out. No Vite, no filesystem.
import { SITE_URL, profile } from '../src/data/profile.js';

const escapeHtml = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const listItems = (items, render) =>
  items.map((item) => `<li>${render(item)}</li>`).join('');

const link = (url, text) =>
  `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`;

const renderPublication = (p) =>
  `${escapeHtml(p.authors)} (${escapeHtml(p.year)}). ${link(p.url, p.title)}. ${escapeHtml(p.venue)}.`;

const renderProject = (p) =>
  `${link(p.url, p.title)}: ${escapeHtml(p.description)} (${escapeHtml(p.stack.join(', '))})`;

/** Static HTML for crawlers that do not run JavaScript. React replaces it on load. */
export function snapshotHtml({ publications, webProjects }) {
  return [
    '<div hidden>',
    `<h1>${escapeHtml(profile.name)}, ${escapeHtml(profile.jobTitle)}</h1>`,
    `<p>${escapeHtml(profile.description)}</p>`,
    '<h2>Publications</h2>',
    `<ul>${listItems(publications, renderPublication)}</ul>`,
    '<h2>Web Projects</h2>',
    `<ul>${listItems(webProjects, renderProject)}</ul>`,
    '</div>',
  ].join('');
}

const personNode = () => ({
  '@type': 'Person',
  '@id': `${SITE_URL}#person`,
  name: profile.name,
  url: SITE_URL,
  image: profile.image,
  description: profile.description,
  jobTitle: profile.jobTitle,
  affiliation: { '@type': 'Organization', ...profile.affiliation },
  worksFor: { '@type': 'Organization', ...profile.lab },
  alumniOf: { '@type': 'CollegeOrUniversity', ...profile.alumniOf },
  knowsAbout: profile.knowsAbout,
  sameAs: profile.sameAs,
});

const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  url: SITE_URL,
  name: profile.name,
  publisher: { '@id': `${SITE_URL}#person` },
  inLanguage: 'en',
});

const articleNode = (p) => ({
  '@type': 'ScholarlyArticle',
  name: p.title,
  datePublished: p.year,
  url: p.url,
  identifier: p.doi,
  isPartOf: { '@type': 'Periodical', name: p.venue },
  author: { '@id': `${SITE_URL}#person` },
});

export function jsonLd({ publications }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [personNode(), websiteNode(), ...publications.map(articleNode)],
  };
}

export const sitemapXml = (lastmod) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n</urlset>\n`;

export const robotsTxt = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`;
