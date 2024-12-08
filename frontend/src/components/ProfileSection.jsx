import React from 'react';
import profileIcon from '../assets/profile-icon.png';
import labDrawing from '../assets/roest-lab.png';

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
            {' '}
            Welcome to my page! Take a look around - this site is powered by
            React, Vite, Sass, and a FastAPI backend.
          </p>
          <p>
            {' '}
            I’m a molecular biologist, protein chemist, and bioinformatician.
            I’m currently pursuing a Ph.D. in computational biology at the
            University of Toronto with Dr. Hannes Röst. When I’m not working,
            I’m usually bass fishing or fixing up old bikes.
          </p>
        </div>
      </div>
      <div className="profile-black-line"></div>
      <div className="lab-drawing-container">
        <img src={labDrawing} alt="Röst Lab Drawing" className="lab-drawing" />
        <h3>
          <i>Röst Lab</i>
        </h3>
        <p>Drawn in the style of Peanuts by Charles Schulz</p>
      </div>
    </div>
  );
};

export default ProfileSection;
