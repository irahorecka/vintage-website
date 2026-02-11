import { useEffect, useState } from 'react';

// Env config uses comma-separated values for optional repo/org include lists.
const parseCsv = (rawValue) =>
  (rawValue || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Canonical repo key used for dedupe across all API sources.
const getRepoId = (repo) =>
  typeof repo?.full_name === 'string' ? repo.full_name.toLowerCase() : null;

const appendRepoTotals = (repo, totals, seenRepoIds) => {
  const repoId = getRepoId(repo);
  // Keep totals idempotent across multiple sources (user repos, org repos, explicit repos).
  if (!repoId || seenRepoIds.has(repoId)) {
    return;
  }

  seenRepoIds.add(repoId);
  if (typeof repo.stargazers_count === 'number') {
    totals.stars += repo.stargazers_count;
  }
  if (typeof repo.forks_count === 'number') {
    totals.forks += repo.forks_count;
  }
};

const fetchAllRepos = async (baseUrl, headers) => {
  let page = 1;
  const repos = [];

  while (true) {
    // Preserve existing query params when appending pagination.
    const separator = baseUrl.includes('?') ? '&' : '?';
    const response = await fetch(
      `${baseUrl}${separator}per_page=100&page=${page}`,
      { headers }
    );

    if (!response.ok) {
      break;
    }

    const pageRepos = await response.json();
    if (!Array.isArray(pageRepos) || pageRepos.length === 0) {
      break;
    }

    repos.push(...pageRepos);
    // Stop when GitHub returns fewer than `per_page` items for the final page.
    if (pageRepos.length < 100) {
      break;
    }
    page += 1;
  }

  return repos;
};

const CodingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [totalForks, setTotalForks] = useState(0);

  useEffect(() => {
    const fetchPinnedRepos = async () => {
      try {
        const query = `
          {
            user(login: "${import.meta.env.VITE_GITHUB_USERNAME}") {
              pinnedItems(first: 6, types: REPOSITORY) {
                nodes {
                  ... on Repository {
                    name
                    description
                    stargazers {
                      totalCount
                    }
                    forkCount
                    url
                    languages(first: 5) {
                      nodes {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
          },
          body: JSON.stringify({ query }),
        });

        const { data } = await response.json();
        // Org-owned repos can be displayed as "org/repo" for clarity.
        const orgPrefixes = new Set(
          parseCsv(import.meta.env.VITE_GITHUB_ORGS).map((org) =>
            org.toLowerCase()
          )
        );

        const formattedProjects = data.user.pinnedItems.nodes.map((repo) => ({
          title: (() => {
            // Parse owner/repo from URL to optionally prefix org repos in the card title.
            try {
              const [owner, repoName] = new URL(repo.url).pathname
                .split('/')
                .filter(Boolean);
              if (owner && repoName && orgPrefixes.has(owner.toLowerCase())) {
                return `${owner}/${repoName}`;
              }
            } catch {
              // Fall through to the default display title.
            }
            return repo.name;
          })(),
          description: repo.description || 'No description provided.',
          stars: repo.stargazers.totalCount,
          forks: repo.forkCount,
          languages: repo.languages.nodes.map((lang) => lang.name),
          link: repo.url,
        }));

        setProjects(formattedProjects);

        // Reuse the same auth header for all GitHub API calls in this effect.
        const githubHeaders = {
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        };

        // Fetch total stars/forks from all personal public repos (with pagination).
        const allRepos = await fetchAllRepos(
          `https://api.github.com/users/${import.meta.env.VITE_GITHUB_USERNAME}/repos`,
          githubHeaders
        );
        const totals = { stars: 0, forks: 0 };
        // Shared dedupe set prevents double-counting the same repo from different endpoints.
        const seenRepoIds = new Set();
        allRepos.forEach((repo) => appendRepoTotals(repo, totals, seenRepoIds));

        // Fetch additional repos and add their stars and forks to totals
        // `VITE_GITHUB_REPOS` expects "owner/repo" entries.
        const addlReposRaw = import.meta.env.VITE_GITHUB_REPOS;
        if (addlReposRaw) {
          const addlRepos = parseCsv(addlReposRaw);
          for (const repoFullName of addlRepos) {
            // repoFullName expected in "owner/repo" format
            try {
              const resp = await fetch(
                `https://api.github.com/repos/${repoFullName}`,
                {
                  headers: githubHeaders,
                }
              );
              if (!resp.ok) continue;
              const repoData = await resp.json();
              appendRepoTotals(repoData, totals, seenRepoIds);
            } catch {
              // Skip this repo on error
              continue;
            }
          }
        }

        // Fetch all repos in extra orgs (e.g., riskportal,himalayas-base).
        // Useful when contributions live outside the main user account.
        const addlOrgs = parseCsv(import.meta.env.VITE_GITHUB_ORGS);
        for (const org of addlOrgs) {
          try {
            const orgRepos = await fetchAllRepos(
              `https://api.github.com/orgs/${org}/repos?type=public`,
              githubHeaders
            );
            orgRepos.forEach((repo) =>
              appendRepoTotals(repo, totals, seenRepoIds)
            );
          } catch {
            continue;
          }
        }

        setTotalStars(totals.stars);
        setTotalForks(totals.forks);
      } catch (error) {
        console.error('Error fetching pinned repos:', error);
      }
    };

    fetchPinnedRepos();
  }, []);

  return (
    <div className="coding-projects-container">
      <div className="section-header">
        <h2>Coding Projects</h2>
      </div>
      <div className="projects-text">
        <p>
          These are some of my coding projects, ranging from API wrappers for
          popular websites to desktop GUI applications for music downloading.
          These projects have received {totalStars} GitHub stars and{' '}
          {totalForks} forks combined. Check out my{' '}
          <a href="https://github.com/irahorecka">GitHub</a> or click through to
          learn more about each.
        </p>
      </div>
      {/* Projects Grid */}
      <div className="project-grid">
        {projects.map((project, index) => (
          <a
            href={project.link}
            rel="noopener noreferrer"
            className="project-card"
            key={index}
          >
            <h3 className="project-title">{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <div className="project-stats">
              <span className="stat">
                <img
                  src="https://api.iconify.design/octicon:star-16.svg?height=16"
                  alt="Stars"
                  className="stat-icon"
                />{' '}
                {project.stars}
              </span>
              <span className="stat">
                <img
                  src="https://api.iconify.design/octicon:repo-forked-16.svg?height=16"
                  alt="Forks"
                  className="stat-icon"
                />{' '}
                {project.forks}
              </span>
              <span className="languages">
                {project.languages.join(', ')} {/* Display top languages */}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CodingProjects;
