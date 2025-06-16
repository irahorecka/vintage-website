import { useEffect, useState } from 'react';

const WebProjects = () => {
  const initialProjects = [
    {
      title: 'Personal Portfolio (2025)',
      description:
        'Dynamic portfolio site showcasing my research and various projects',
      url: 'https://irahorecka.com',
      stack: ['React', 'Sass', 'FastAPI', 'Nginx'],
    },
    {
      title: 'Schoellman Family Recipe Book (2025)',
      description: 'Markdown-based family recipe site with a retro flair',
      url: 'https://gardenofrecipes.org',
      stack: ['React', 'Tailwind CSS', 'Github Pages'],
    },
    // {
    //   title: 'Human Genetic Interactions (2025)',
    //   description: 'Official site for the Human Genetic Interactions project',
    //   url: 'https://thecellmap.org/human/',
    //   stack: ['React', 'SigmaJS', 'Bootstrap', 'Django', 'Apache'],
    // },
    {
      title: 'RISK Network Documentation (2025)',
      description: 'Official site for the RISK Network project',
      url: 'https://riskportal.github.io/network-tutorial/',
      stack: ['MkDocs', 'Binder', 'Github Pages'],
      favicon:
        'https://riskportal.github.io/network-tutorial/images/risk_logo.ico',
    },
    {
      title: 'Toronto Bioinformatics Hackathon (2025)',
      description: 'Official site for the Toronto Bioinformatics Hackathon',
      url: 'https://hackbio.ca',
      stack: ['jQuery', 'Bootstrap', 'Github Pages'],
    },
    {
      title: 'Jellyfin Media Server (2024)',
      description: 'Personal site for my Jellyfin media server',
      url: 'https://jellyfin.irahorecka.com',
      stack: ['Nginx'],
      favicon:
        'https://static-00.iconduck.com/assets.00/jellyfin-icon-256x256-4ecyicmj.png',
    },
    {
      title: 'Module-Level Genetic Interactions (2023)',
      description:
        'Personal site for the Module-Level Genetic Interactions project',
      url: 'https://crosstalk.irahorecka.com',
      stack: ['jQuery', 'SigmaJS', 'Bootstrap', 'Flask', 'Nginx'],
      favicon: 'https://crosstalk.irahorecka.com/static/images/favicon.ico',
    },
    {
      title: 'Personal Recipe Book (2022)',
      description: 'Templates-based recipe site with a minimalist aesthetic',
      url: 'https://irahorecka.github.io/recipe-website/',
      stack: ['jQuery', 'Bootstrap', 'Lektor', 'Github Pages'],
      favicon:
        'https://irahorecka.github.io/recipe-website/images/logos/recipe-website-logo-32px.png?h=8acf1ede',
    },
    {
      title: 'Kavis Technology LLC (2021)',
      description:
        'Official site for Kavis Technology LLC, a hardware manufacturing company',
      url: 'https://kavis-tech.com/',
      stack: ['jQuery', 'Bootstrap', 'Lektor', 'FileZilla'],
      favicon: 'https://kavis-tech.com/images/logos/kavistech-icon-favicon.png',
    },
  ];

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
          I've built and contributed to a number of websites for personal use,
          lab projects, and scientific tools. Some are static, others dynamic—
          ranging from markdown-based notebooks to full-stack applications with
          custom APIs. I take on the occasional freelance project, so feel free
          to reach out if you have something in mind.
        </p>
      </div>
      <div className="project-grid">
        {webProjects.map((project, index) => (
          <a
            key={index}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
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
