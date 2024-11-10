import React from 'react';
import Sidebar from './Sidebar';
import profileIcon from '../assets/profile-icon.png';
import metabolicNetwork from '../assets/metabolic-network.gif';
import '../styles/vintage.css';

// Function to get the current date in the format "MONTH DAY"
function getCurrentDate() {
  const options = { month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

function Content() {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <section className="top-header">
          <img src={profileIcon} alt="Profile Icon" className="header-image-left" />
          <h1>Good to see you!</h1>
          <div className="year-background">2024</div>
          <div className="date-banner">{getCurrentDate()}</div>
        </section>
        
        {/* Main Content Layout */}
        <div className="content-layout">
          <section className="left-content">
            <div className="blue-line top"></div>
            <h2>Introducing My Projects</h2>
            <p>Explore my projects that bring retro vibes to modern development.</p>
            <div className="project-card">
              <h3>Project 1: Retro Revival</h3>
              <p>A deep dive into classic website design with a modern twist.</p>
            </div>
            <div className="blue-line bottom"></div>
          </section>
          <aside className="right-sidebar">
            <div className="feature-box">
              <img src={metabolicNetwork} alt="Yeast Metabolic Network" className="right-sidebar-image" />
              <h3><i>S. cerevisiae</i></h3>
              <p>The Metabolic Network in 3D!</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Content;
