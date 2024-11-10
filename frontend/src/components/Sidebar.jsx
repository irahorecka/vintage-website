import React, { useState } from 'react';
import RetroButton from './RetroButton';
import '../styles/vintage.css';
import profilePic from '../assets/profile.png';

const Sidebar = () => {
  const [selectedLink, setSelectedLink] = useState('');

  const links = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'Personal Blog', url: 'https://myblog.com' },
    { name: 'Portfolio', url: 'https://portfolio.com' }
  ];

  const handleGoClick = () => {
    if (selectedLink) {
      window.open(selectedLink, '_blank');
    }
  };

  return (
    <div className="sidebar">
      {/* Profile Image */}
      <img src={profilePic} alt="Profile" className="profile-image" />

      {/* Name and CV Button */}
      <h2 className="name">Ira Horecka</h2>
      <RetroButton text="C.V." />

      {/* Divider */}
      <div className="divider"></div>

      {/* Navigation Links */}
      <a href="#about">About Me</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>

      {/* Divider */}
      <div className="divider"></div>

      {/* Scrollable Window for Links */}
      <h2>Find Me Elsewhere</h2>
      <div className="vintage-window">
        <select 
          className="vintage-dropdown"
          onChange={(e) => setSelectedLink(e.target.value)}
          size="5"
        >
          {links.map((link, index) => (
            <option key={index} value={link.url}>
              {link.name}
            </option>
          ))}
        </select>
        <div className="retro-button-container">
          <RetroButton text="Go" onClick={handleGoClick} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
