import { useEffect, useState } from 'react';

import { webProjects as initialProjects } from '../data/webProjects';

const WebProjects = () => {
  const [webProjects, setWebProjects] = useState([]);

  useEffect(() => {
    const projectsWithFavicons = initialProjects.map((project) => {
      if (project.favicon) {
        return project;
      }
      const urlObj = new URL(project.url);
      const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
      return { ...project, favicon: fallbackFavicon };
    });
    setWebProjects(projectsWithFavicons);
  }, []);

  return (
    <div className="web-projects-container">
      <div className="section-header">
        <h2>Web Projects</h2>
      </div>
      <div className="projects-text">
        <p>
          I&apos;ve built and contributed to websites for personal use, academic
          projects, and commercial clients. These range from static
          documentations to dynamic, full-stack applications. I take on the
          occasional freelance project—feel free to reach out if you have
          something in mind.
        </p>
      </div>
      <div className="project-grid">
        {webProjects.map((project, index) => (
          <a
            key={index}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title}`}
            className="project-row"
          >
            <img src={project.favicon} alt="favicon" className="favicon" />
            <div>
              <span className="project-title">{project.title}</span> <br />
              <span className="project-description">{project.description}</span>
              <br />
              <span className="project-stack">{project.stack.join(', ')}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default WebProjects;
