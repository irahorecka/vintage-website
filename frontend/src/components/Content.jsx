import React from 'react';
import profileIcon from '../assets/profile-icon.png';
import '../styles/vintage.css';

// Function to get the current date in the format "MONTH DAY, YEAR"
function getCurrentDate() {
  const options = { month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

function Content() {
  return (
    <main className="main-content">
      <section className="top-header">
        {/* Profile Image */}
        <img src={profileIcon} alt="Profile" className="header-image-left" />
        {/* Title */}
        <h1>Welcome Aboard!</h1>
        {/* Large faded year in the background */}
        <div className="year-background">2024</div>
        {/* Retro Date Banner */}
        <div className="date-banner">{getCurrentDate()}</div>
      </section>
    </main>
  );
}

export default Content;
