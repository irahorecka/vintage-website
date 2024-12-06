import React from 'react';
import profileIcon from '../assets/profile-icon.png';
import '../styles/vintage.css';

const ProfileSection = () => {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Who am I?</h2>
        <img src={profileIcon} alt="Profile Icon" className="profile-image-icon" />
      </div>
      <div className="profile-text">
        <p>
          I started out in biochemistry and molecular biology, spent some time in lab automation, and then jumped
          into the PhD life. Now, I’m focused on uncovering pathway crosstalk in <i>Saccharomyces cerevisiae</i> by
          analyzing genetic interactions and established modules. On the side, I work on RISK, a tool I created to
          explore network annotation and hidden connections.
        </p>
        <p>
          When I’m not knee-deep in network analyses, you’ll probably find me bass fishing or breathing new life
          into old bicycles. Whether it’s in the lab or on the lake, I’m always chasing that next big discovery!
        </p>
      </div>
    </div>
  );
};

export default ProfileSection;
