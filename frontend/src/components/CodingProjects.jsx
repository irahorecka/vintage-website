import React, { useState, useEffect } from 'react';

const CodingProjects = () => {
  const [projects, setProjects] = useState([]);
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
          These are some of the projects I’ve worked on, ranging from tools for
          exploring networks to retro-inspired UI components. Check out my{' '}
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
