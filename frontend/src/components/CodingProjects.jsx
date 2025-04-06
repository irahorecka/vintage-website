import React, { useEffect, useState } from 'react';

const CodingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [totalStars, setTotalStars] = useState(0);

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

        const formattedProjects = data.user.pinnedItems.nodes.map((repo) => ({
          title: repo.name,
          description: repo.description || 'No description provided.',
          stars: repo.stargazers.totalCount,
          forks: repo.forkCount,
          languages: repo.languages.nodes.map((lang) => lang.name),
          link: repo.url,
        }));

        setProjects(formattedProjects);

        // Fetch total stars from all public repos
        const starCountResponse = await fetch(
          `https://api.github.com/users/${import.meta.env.VITE_GITHUB_USERNAME}/repos?per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            },
          }
        );
        const allRepos = await starCountResponse.json();
        setTotalStars(
          allRepos.reduce((acc, repo) => acc + repo.stargazers_count, 0)
        );
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
      <div className="coding-projects-text">
        <p>
          These are some of the projects I’ve worked on, ranging from API
          wrappers for popular websites to desktop GUI applications for music
          downloading. These projects have received over {totalStars} GitHub
          stars combined. Check out my{' '}
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
