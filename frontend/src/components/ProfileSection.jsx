import ProteinViewer from './ProteinViewer';

import profileIcon from '../assets/profile-icon.png';

const ProfileSection = () => {
  return (
    <div className="main-container">
      <div className="profile-container">
        <div className="section-header">
          <h2>Greetings!</h2>
          <img
            src={profileIcon}
            alt="Profile Icon"
            className="profile-image-icon"
          />
        </div>
        <div className="profile-text">
          <p>
            Welcome to my page! Take a look around—this site is served by Nginx
            and built with React, Sass, and a FastAPI backend.
          </p>
          <p>
            I'm a molecular biologist, protein chemist, and bioinformatician,
            currently pursuing a PhD in computational biology at the University
            of Toronto with Dr. Hannes Röst. When I'm not working, you can find
            me bass fishing or restoring old bikes.
          </p>
        </div>
      </div>
      <div className="profile-black-line"></div>
      <ProteinViewer pdbId="4EGO" />
    </div>
  );
};

export default ProfileSection;
