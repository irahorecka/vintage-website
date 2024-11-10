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
          <div className="quote-container">
            <h1>A point in every direction is the same as having no point at all!</h1>
            <h1>—Harry Nilsson</h1>
          </div>
          <div className="year-background">2024</div>
          <div className="date-banner">{getCurrentDate()}</div>
        </section>
        
        {/* Main Content Layout */}
        <div className="content-layout">
          <section className="left-content">
            <div className="blue-line top"></div>
            <div className="profile-container">
              <div className="profile-header">
                <h2>Who am I?</h2>
                <img src={profileIcon} alt="Profile Icon" className="profile-image-icon" />
              </div>
              <div className="profile-text">
                <p>I started out in biochemistry and molecular biology, spent some time in lab automation, and then jumped into the PhD life. Now, I’m focused on uncovering pathway crosstalk in <i>Saccharomyces cerevisiae</i> by analyzing genetic interactions and established modules. On the side, I work on RISK, a tool I created to explore network annotation and hidden connections.</p>
                <p>When I’m not knee-deep in network analyses, you’ll probably find me bass fishing or breathing new life into old bicycles. Whether it’s in the lab or on the lake, I’m always chasing that next big discovery!</p>
              </div>
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
