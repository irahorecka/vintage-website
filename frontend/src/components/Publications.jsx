import { useEffect, useState } from 'react';

const OPENALEX_DOI_ENDPOINT = 'https://api.openalex.org/works/https://doi.org/';
const TARGET_AUTHOR = 'Horecka, I.';

const publications = [
  {
    authors: 'Horecka, I., & Rost, H.',
    year: '2026',
    title:
      'RISK: a next-generation tool for biological network annotation and visualization',
    venue: 'Bioinformatics, 42(1), btaf669',
    doi: '10.1093/bioinformatics/btaf669',
    url: 'https://doi.org/10.1093/bioinformatics/btaf669',
  },
  {
    authors:
      'Billmann, M., Costanzo, M., Zhang, X., Hassan, A. Z., Rahman, M., Brown, K. R., Chan, K. S., Tong, A. H. Y., Pons, C., Ward, H. N., Ross, C., van Leeuwen, J., Aregger, M., Lawson, K. A., Mair, B., Roth, A. F., Sen, N. E., Forster, D., Tan, G., Mero, P., Masud, S. N., Lee, Y., Aguilera-Uribe, M., Usaj, M., Almeida, S. M. T., Aulakh, K., Bhojoo, U., Birkadze, S., Budijono, N., Cai, X., Caumanns, J. J., Chandrashekhar, M., Chang, D., Climie, R., Dasgupta, K., Drazic, A., Rojas Echenique, J. I., Gacesa, R., Granda Farias, A., Habsid, A., Horecka, I., Kantautas, K., Ji, F., Kim, D-K., Lee, S. Y., Liang, W., Lim, J., Lin, K., Lu, X., Nami, B., Nixon, A., Mikolajewicz, N., Nedyalkova, L., Rohde, T., Sartori Rodrigues, M., Soste, M., Schultz, E., Wang, W., Seetharaman, A., Shuteriqi, E., Sizova, O., Thomson Taylor, D., Tereshchenko, M., Tieu, D., Turowec, J., Ubhi, T., Varland, S., Wang, K. E., Yang Wang, Z., Wei, J., Xiao, Y-X., Brown, G. W., Cravatt, B. F., Dixon, S. J., Wyatt, H. D. M., Röst, H. L., Roth, F. P., Xia, T., Bader, G. D., Loewith, R., Davis, N. G., Andrews, B., Myers, C. L., Moffat, J., Boone, C.',
    year: '2025',
    title:
      'A global genetic interaction map of a human cell reveals conserved principles of genetic networks',
    venue: 'bioRxiv',
    doi: '10.1101/2025.06.30.662193',
    url: 'https://doi.org/10.1101/2025.06.30.662193',
  },
  {
    authors:
      'Sing, J. C., Charkow, J., AlHigaylan, M., Horecka, I., Xu, L., & Rost, H. L.',
    year: '2024',
    title:
      'MassDash: A Web-Based Dashboard for Data-Independent Acquisition Mass Spectrometry Visualization',
    venue: 'Journal of Proteome Research, 23(6), 2306-2314',
    doi: '10.1021/acs.jproteome.4c00026',
    url: 'https://doi.org/10.1021/acs.jproteome.4c00026',
  },
  {
    authors: 'Clarke, J., Dephoure, N., Horecka, I., Gygi, S., & Kellogg, D.',
    year: '2017',
    title:
      'A conserved signaling network monitors delivery of sphingolipids to the plasma membrane in budding yeast',
    venue: 'Molecular Biology of the Cell, 28(20), 2589-2599',
    doi: '10.1091/mbc.E17-01-0081',
    url: 'https://doi.org/10.1091/mbc.E17-01-0081',
  },
  {
    authors:
      'Van Leeuwen, J., Pons, C., Mellor, J. C., Yamaguchi, T. N., Friesen, H., Koschwanez, J., Mattiazzi Ušaj, M., Pechlaner, M., Takar, M., Ušaj, M., VanderSluis, B., Andrusiak, K., Bansal, P., Baryshnikova, A., Boone, C. E., Cao, J., Cote, A., Gebbia, M., Horecka, G., Horecka, I., Kuzmin, E., Legro, N., Liang, W., Van Lieshout, N., McNee, M., San Luis, B-J., Shaeri, F., Shuteriqi, E., Sun, S., Yang, L., Youn, J-Y., Yuen, M., Costanzo, M., Gingras, A-C., Aloy, P., Oostenbrink, C., Murray, A., Graham, T. R., Myers, C. L., Andrews, B. J., Roth, F. P., Boone, C.',
    year: '2016',
    title: 'Exploring genetic suppression interactions on a global scale',
    venue: 'Science, 354(6312), aag0839',
    doi: '10.1126/science.aag0839',
    url: 'https://doi.org/10.1126/science.aag0839',
    note: 'Additional Scholar record listed as "Science 354: aag0839" (cited by 12).',
  },
];

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
              </p>

              <div className="publication-meta">
                {typeof citationData?.count === 'number' &&
                  (citationData.citationsUrl ? (
                    <a
                      href={citationData.citationsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open citations for ${publication.title}`}
                      className="publication-cited-by publication-cited-by-link"
                    >
                      Cited by {citationData.count}
                    </a>
                  ) : (
                    <span className="publication-cited-by">
                      Cited by {citationData.count}
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
