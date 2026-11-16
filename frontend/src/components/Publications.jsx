import { useEffect, useState } from 'react';

import { publications } from '../data/publications';

const OPENALEX_DOI_ENDPOINT = 'https://api.openalex.org/works/https://doi.org/';
const TARGET_AUTHOR = 'Horecka, I.';

const buildOpenAlexWorkUrl = (doi) =>
  `${OPENALEX_DOI_ENDPOINT}${encodeURIComponent(doi)}`;

const extractWorkId = (openAlexWorkId) => {
  if (typeof openAlexWorkId !== 'string') {
    return null;
  }
  return openAlexWorkId.split('/').pop() || null;
};

const buildCitationsUrl = (workId) =>
  `https://openalex.org/works?filter=${encodeURIComponent(`cites:${workId}`)}`;

// Remove failed lookups before converting to a DOI -> citation data map.
const mapCitationEntries = (entries) =>
  Object.fromEntries(entries.filter(Boolean));

const getCitationDisplayData = (publication, citationData) => {
  if (!publication.doi) {
    return null;
  }

  if (typeof citationData?.count === 'number') {
    return {
      count: citationData.count,
      citationsUrl: citationData.citationsUrl || null,
    };
  }

  // Fresh preprints may exist on bioRxiv before OpenAlex indexing catches up.
  return {
    count: 0,
    citationsUrl: null,
  };
};

const renderAuthors = (authors) => {
  if (typeof authors !== 'string' || authors.length === 0) {
    return authors;
  }

  // Split on the exact last-first token so only the intended author string is emphasized.
  const segments = authors.split(TARGET_AUTHOR);
  if (segments.length === 1) {
    return authors;
  }

  return segments.flatMap((segment, index) => {
    if (index === segments.length - 1) {
      return [segment];
    }

    return [
      segment,
      <span className="publication-author-self" key={`author-self-${index}`}>
        {TARGET_AUTHOR}
      </span>,
    ];
  });
};

const Publications = () => {
  const [liveCitationData, setLiveCitationData] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    // DOI is the stable key used for live citation lookups.
    const fetchCitationCounts = async () => {
      try {
        const results = await Promise.all(
          publications.map(async ({ doi }) => {
            if (!doi) {
              return null;
            }

            try {
              const response = await fetch(buildOpenAlexWorkUrl(doi), {
                signal: controller.signal,
              });
              if (!response.ok) {
                return null;
              }

              const data = await response.json();
              if (typeof data.cited_by_count !== 'number') {
                return null;
              }

              const workId = extractWorkId(data.id);
              return [
                doi,
                {
                  count: data.cited_by_count,
                  citationsUrl: workId ? buildCitationsUrl(workId) : null,
                },
              ];
            } catch {
              return null;
            }
          })
        );

        setLiveCitationData(mapCitationEntries(results));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching live citations:', error);
        }
      }
    };

    fetchCitationCounts();

    // Abort pending requests when unmounting or switching to avoid stale state updates.
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="publications-container">
      <div className="section-header">
        <h2>Publications</h2>
      </div>

      <div className="publications-text">
        <p>
          A curated list of my scientific publications, also available on{' '}
          <a
            href="https://scholar.google.com/citations?user=RYufrIkAAAAJ&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Google Scholar profile"
          >
            Google Scholar
          </a>
          .
        </p>
      </div>

      <div className="publications-list">
        {publications.map((publication) => {
          const citationData = liveCitationData[publication.doi];
          const citationDisplayData = getCitationDisplayData(
            publication,
            citationData
          );
          const publicationKey = publication.doi || publication.title;

          return (
            <article className="publication-entry" key={publicationKey}>
              <p className="publication-citation">
                <span className="publication-authors">
                  {renderAuthors(publication.authors)} ({publication.year}).
                </span>
                <br />
                <span className="publication-title">
                  {publication.title}
                </span>. <br />
                <span className="publication-venue">{publication.venue}</span>.
                {publication.summary && (
                  <>
                    <br />
                    <span className="publication-summary">
                      {publication.summary}
                    </span>
                  </>
                )}
              </p>

              <div className="publication-meta">
                {citationDisplayData &&
                  (citationDisplayData.citationsUrl ? (
                    <a
                      href={citationDisplayData.citationsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open citations for ${publication.title}`}
                      className="publication-cited-by publication-cited-by-link"
                    >
                      Cited by {citationDisplayData.count}
                    </a>
                  ) : (
                    <span className="publication-cited-by">
                      Cited by {citationDisplayData.count}
                    </span>
                  ))}
                {publication.url && (
                  <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open DOI for ${publication.title}`}
                    className="publication-link"
                  >
                    DOI
                  </a>
                )}
                {publication.note && (
                  <span className="publication-note">{publication.note}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Publications;
