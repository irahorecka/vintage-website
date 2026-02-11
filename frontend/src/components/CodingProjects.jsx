import { useEffect, useState } from 'react';

// Shared configuration for GitHub fetch behavior.
const GITHUB_API_BASE = 'https://api.github.com';
const PINNED_REPO_LIMIT = 6;

// Env config uses comma-separated values for optional repo/org include lists.
const parseCsv = (rawValue) =>
  (rawValue || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Canonical repo key used for dedupe across all API sources.
const getRepoId = (repo) =>
  typeof repo?.full_name === 'string' ? repo.full_name.toLowerCase() : null;

// Fallback link used when repo API responses fail.
const getGitHubRepoLink = (repoFullName) =>
  `https://github.com/${repoFullName}`;

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

// Generic pagination helper for GitHub list endpoints.
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

// Single-repo fetch with memoization to avoid duplicate API calls.
const fetchRepoByFullName = async (repoFullName, repoCache) => {
  const cacheKey = repoFullName.toLowerCase();
  if (repoCache.has(cacheKey)) {
    return repoCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${repoFullName}`);
    if (!response.ok) {
      repoCache.set(cacheKey, null);
      return null;
    }

    const repo = await response.json();
    repoCache.set(cacheKey, repo);
    return repo;
  } catch {
    repoCache.set(cacheKey, null);
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

// Resolve pinned repos in parallel while preserving env order.
const fetchPinnedProjects = async (pinnedRepoNames, orgPrefixes, repoCache) =>
  Promise.all(
    pinnedRepoNames.map(async (repoFullName) => {
      const repo = await fetchRepoByFullName(repoFullName, repoCache);
      if (!repo) {
        return buildUnavailableProject(
          repoFullName,
          'Unavailable (private repo, typo, or rate-limited).'
        );
      }
      return formatProjectCard(repo, orgPrefixes);
    })
  );

const CodingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [totalForks, setTotalForks] = useState(0);

  useEffect(() => {
    // Run once on mount: fetch cards first, then aggregate totals.
    const fetchRepos = async () => {
      try {
        // Read all repo inputs from env; first N entries are treated as pinned.
        const envRepos = parseCsv(import.meta.env.VITE_GITHUB_REPOS);
        const pinnedRepoNames = envRepos.slice(0, PINNED_REPO_LIMIT);
        const addlOrgs = parseCsv(import.meta.env.VITE_GITHUB_ORGS);
        const username = import.meta.env.VITE_GITHUB_USERNAME;
        const repoCache = new Map();

        // Keep org names normalized for display decisions.
        const orgPrefixes = new Set(addlOrgs.map((org) => org.toLowerCase()));

        const pinnedProjects = await fetchPinnedProjects(
          pinnedRepoNames,
          orgPrefixes,
          repoCache
        );
        // Show cards as soon as pinned data is ready.
        setProjects(pinnedProjects);

        const totals = { stars: 0, forks: 0 };
        // Shared dedupe set prevents double-counting the same repo from different endpoints.
        const seenRepoIds = new Set();

        if (username) {
          // Include all personal public repos in totals.
          const personalRepos = await fetchAllRepos(
            `${GITHUB_API_BASE}/users/${username}/repos`
          );
          addReposToTotals(personalRepos, totals, seenRepoIds);
        }

        // Also count explicitly listed repos (reuses the same cache).
        const envRepoData = await Promise.all(
          envRepos.map((repoFullName) =>
            fetchRepoByFullName(repoFullName, repoCache)
          )
        );
        addReposToTotals(envRepoData.filter(Boolean), totals, seenRepoIds);

        // Add optional org-wide totals for external contribution repos.
        const orgRepoLists = await Promise.all(
          addlOrgs.map((org) =>
            fetchAllRepos(`${GITHUB_API_BASE}/orgs/${org}/repos?type=public`)
          )
        );
        addReposToTotals(orgRepoLists.flat(), totals, seenRepoIds);

        setTotalStars(totals.stars);
        setTotalForks(totals.forks);
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
