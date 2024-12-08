import React from 'react';

const CodingProjects = () => {
  const projects = [
    {
      title: 'Comics Portal',
      description: 'Explore classic comics with ease.',
      stars: 42,
      forks: 10,
      languages: ['Python', 'JavaScript', 'HTML'],
      link: 'https://github.com/user/comics-portal',
    },
    {
      title: 'Network Visualizer',
      description: 'Interactive graphs for data exploration.',
      stars: 35,
      forks: 15,
      languages: ['JavaScript', 'HTML', 'CSS'],
      link: 'https://github.com/user/network-visualizer',
    },
    {
      title: 'RISK Tool',
      description: 'Network annotation and enrichment.',
      stars: 50,
      forks: 20,
      languages: ['Python', 'R', 'Bash'],
      link: 'https://github.com/user/risk-tool',
    },
    {
      title: 'Recipe Organizer',
      description: 'Streamline and categorize your favorite recipes.',
      stars: 25,
      forks: 8,
      languages: ['Python', 'CSS', 'SQL'],
      link: 'https://github.com/user/recipe-organizer',
    },
    {
      title: 'Vintage UI Toolkit',
      description: 'Reusable components with retro aesthetics.',
      stars: 30,
      forks: 12,
      languages: ['JavaScript', 'CSS', 'TypeScript'],
      link: 'https://github.com/user/vintage-ui-toolkit',
    },
    {
      title: 'P10k Optimizer',
      description: 'Enhance computation workflows effortlessly.',
      stars: 60,
      forks: 25,
      languages: ['Python', 'Shell', 'Perl'],
      link: 'https://github.com/user/p10k-optimizer',
    },
  ];

  return (
    <div className="coding-projects-container">
      <div className="section-header">
        <h2>Coding Projects</h2>
      </div>
      <div className="coding-projects-text">
        <p>
          These are some of the projects I’ve worked on, ranging from tools for
          exploring networks to retro-inspired UI components. Click through to
          learn more about each.
        </p>
      </div>
      {/* Projects Grid */}
      <div className="project-grid">
        {projects.map((project, index) => (
          <a
            href={project.link}
            target="_blank"
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
