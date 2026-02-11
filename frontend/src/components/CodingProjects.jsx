import { useEffect, useState } from 'react';

// Shared constants for GitHub API calls and pinned-card count.
const GITHUB_API_BASE = 'https://api.github.com';
const PINNED_REPO_LIMIT = 6;
const CACHE_KEY = 'codingProjectsCache';

// Env list values are provided as comma-separated strings.
const parseCsv = (rawValue) =>
  (rawValue || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Canonical repo key used for dedupe across all API sources.
const getRepoId = (repo) =>
  typeof repo?.full_name === 'string' ? repo.full_name.toLowerCase() : null;

// Safe GitHub page URL used when API fields are missing/unavailable.
const getGitHubRepoLink = (repoFullName) =>
  `https://github.com/${repoFullName}`;

const loadCachedProjects = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached?.timestamp) return null;
    return cached;
  } catch {
    return null;
  }
};

const saveCachedProjects = (projects, totalStars, totalForks) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        projects,
        totalStars,
        totalForks,
      })
    );
  } catch {
    // Ignore storage errors (private mode, quota, etc).
  }
};

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

const addReposToTotals = (repos, totals, seenRepoIds) => {
  repos.forEach((repo) => appendRepoTotals(repo, totals, seenRepoIds));
};

// Pagination helper for GitHub list endpoints.
const fetchAllRepos = async (baseUrl) => {
  let page = 1;
  const repos = [];

  while (true) {
    // Preserve existing query params when appending pagination.
    const separator = baseUrl.includes('?') ? '&' : '?';
    const response = await fetch(
      `${baseUrl}${separator}per_page=100&page=${page}`
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

// Fetch one repository by "owner/repo"; returns null on any failure.
const fetchRepoByFullName = async (repoFullName) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${repoFullName}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
};

// Stable UI fallback for missing/inaccessible repositories.
const buildUnavailableProject = (repoFullName, description) => ({
  title: repoFullName,
  description,
  stars: 0,
  forks: 0,
  languages: [],
  link: getGitHubRepoLink(repoFullName),
});

// Convert a GitHub repo payload into the project card view-model.
const formatProjectCard = (repo, orgPrefixes) => {
  const owner = repo?.owner?.login || '';
  const isOrgRepo = orgPrefixes.has(owner.toLowerCase());
  const primaryLanguage = repo.language ? [repo.language] : [];
  const fullName =
    repo.full_name ||
    [repo?.owner?.login, repo?.name].filter(Boolean).join('/');

  return {
    title: isOrgRepo && fullName ? fullName : repo.name,
    description: repo.description || 'No description provided.',
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    languages: primaryLanguage,
    link: repo.html_url || getGitHubRepoLink(fullName),
  };
};

// Index repositories by normalized "owner/repo" for quick lookups.
const buildRepoIndex = (repos) => {
  const index = new Map();
  repos.forEach((repo) => {
    const repoId = getRepoId(repo);
    if (repoId) {
      index.set(repoId, repo);
    }
  });
  return index;
};

const safeFetchAllRepos = async (baseUrl) => {
  try {
    return await fetchAllRepos(baseUrl);
  } catch {
    // Treat transient network failures as empty pages.
    return [];
  }
};

const CodingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [totalForks, setTotalForks] = useState(0);

  useEffect(() => {
    // Run once on mount: fetch cards first, then aggregate totals.
    const fetchRepos = async () => {
      try {
        const cached = loadCachedProjects();
        if (cached) {
          setProjects(cached.projects || []);
          setTotalStars(cached.totalStars || 0);
          setTotalForks(cached.totalForks || 0);
        }

        // Read all repo inputs from env; first N entries are treated as pinned.
        const envRepos = parseCsv(import.meta.env.VITE_GITHUB_REPOS);
        const pinnedRepoNames = envRepos.slice(0, PINNED_REPO_LIMIT);
        const addlOrgs = parseCsv(import.meta.env.VITE_GITHUB_ORGS);
        const username = import.meta.env.VITE_GITHUB_USERNAME;

        // Keep org names normalized for display decisions.
        const orgPrefixes = new Set(addlOrgs.map((org) => org.toLowerCase()));

        // Fetch user and org repositories once; reuse this data for cards and totals.
        if (username) {
          const personalRepos = await safeFetchAllRepos(
            `${GITHUB_API_BASE}/users/${username}/repos`
          );
          const orgRepoLists = await Promise.all(
            addlOrgs.map((org) =>
              safeFetchAllRepos(
                `${GITHUB_API_BASE}/orgs/${org}/repos?type=public`
              )
            )
          );

          const knownRepos = [...personalRepos, ...orgRepoLists.flat()];
          const repoIndex = buildRepoIndex(knownRepos);
          const hasNetworkData = knownRepos.length > 0;

          // For env repos outside username/org lists, fetch only the missing ones.
          const missingEnvRepos = (
            await Promise.all(
              envRepos.map((repoFullName) => {
                const key = repoFullName.toLowerCase();
                return repoIndex.has(key)
                  ? Promise.resolve(null)
                  : fetchRepoByFullName(repoFullName);
              })
            )
          ).filter(Boolean);

          missingEnvRepos.forEach((repo) => {
            const repoId = getRepoId(repo);
            if (repoId) {
              repoIndex.set(repoId, repo);
            }
          });

          // Render pinned cards in env order, using unavailable placeholders when missing.
          const pinnedProjects = pinnedRepoNames.map((repoFullName) => {
            const repo = repoIndex.get(repoFullName.toLowerCase());
            if (!repo) {
              return buildUnavailableProject(
                repoFullName,
                'Unavailable (private repo, typo, or rate-limited).'
              );
            }
            return formatProjectCard(repo, orgPrefixes);
          });
          setProjects(pinnedProjects);

          const totals = { stars: 0, forks: 0 };
          // Shared dedupe set prevents double-counting the same repo from different endpoints.
          const seenRepoIds = new Set();
          addReposToTotals(
            [...knownRepos, ...missingEnvRepos],
            totals,
            seenRepoIds
          );
          setTotalStars(totals.stars);
          setTotalForks(totals.forks);

          if (hasNetworkData || missingEnvRepos.length > 0) {
            saveCachedProjects(pinnedProjects, totals.stars, totals.forks);
          }
          return;
        }

        // No username configured: still render cards from explicit env repos.
        const explicitRepos = (
          await Promise.all(
            envRepos.map((repoFullName) => fetchRepoByFullName(repoFullName))
          )
        ).filter(Boolean);
        const repoIndex = buildRepoIndex(explicitRepos);

        const pinnedProjects = pinnedRepoNames.map((repoFullName) => {
          const repo = repoIndex.get(repoFullName.toLowerCase());
          if (!repo) {
            return buildUnavailableProject(
              repoFullName,
              'Unavailable (private repo, typo, or rate-limited).'
            );
          }
          return formatProjectCard(repo, orgPrefixes);
        });
        setProjects(pinnedProjects);

        const totals = { stars: 0, forks: 0 };
        const seenRepoIds = new Set();
        addReposToTotals(explicitRepos, totals, seenRepoIds);
        setTotalStars(totals.stars);
        setTotalForks(totals.forks);

        if (explicitRepos.length > 0) {
          saveCachedProjects(pinnedProjects, totals.stars, totals.forks);
        }
      } catch (error) {
        console.error('Error fetching pinned repos:', error);
      }
    };

    fetchRepos();
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
