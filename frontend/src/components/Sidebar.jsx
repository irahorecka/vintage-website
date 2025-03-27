import React, { useState } from 'react';
import RetroButton from './RetroButton';

import CV from '../assets/ira-horecka-cv.pdf';
import profilePic from '../assets/profile-landscape.png';

const Sidebar = () => {
  const links = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/ira-horecka-3a8877128/',
    },
    { name: 'GitHub', url: 'https://github.com/irahorecka' },
    {
      name: 'Google Scholar',
      url: 'https://scholar.google.ca/citations?user=RYufrIkAAAAJ&hl=en',
    },
    {
      name: 'Stack Overflow',
      url: 'https://stackoverflow.com/users/10500424/irahorecka',
    },
    { name: 'Mail', url: 'mailto:ira.horecka@yahoo.com' },
  ];

  // Automatically set the first link as the default selected option
  const [selectedLink, setSelectedLink] = useState(links[0].url);

  const handleGoClick = () => {
    if (selectedLink) {
      window.location.href = selectedLink; // Navigate to the selected URL in the same window
    }
  };

  const handleCVClick = () => {
    window.open(CV, '_blank', 'noopener,noreferrer'); // Open the CV in a new tab
  };

  // Handle selection change in the dropdown
  const handleSelectChange = (e) => {
    setSelectedLink(e.target.value);
  };

  return (
    <div className="sidebar">
      {/* Profile Section */}
      <img src={profilePic} alt="Profile" className="profile-image" />
      <h2 className="name">Ira Horecka</h2>
      <RetroButton text="C.V." onClick={handleCVClick} />

      <div className="divider"></div>
      <a href="#home">Home</a>
      <a href="#comics">Comics</a>
      <a href="#ast">AST</a>
      <a href="#projects">Projects</a>

      <div className="divider"></div>
      <h2>Find Me Elsewhere</h2>

      {/* Dropdown for selecting a link */}
      <div className="vintage-window">
        <select
          className="vintage-dropdown"
          onChange={handleSelectChange}
          value={selectedLink}
          size="5"
        >
          {links.map((link, index) => (
            <option key={index} value={link.url}>
              {link.name}
            </option>
          ))}
        </select>

        {/* Go Button */}
        <div className="retro-button-container">
          <RetroButton text="Go" onClick={handleGoClick} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
