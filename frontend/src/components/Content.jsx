import React from 'react';
import Sidebar from './Sidebar';
import ProfileSection from './ProfileSection'; // Import the new component
import MetabolicNetwork from './MetabolicNetwork'; // Import the new component
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
            <ProfileSection /> {/* Use modularized profile section */}
            <div className="blue-line bottom"></div>
          </section>
          <aside className="right-sidebar">
            <MetabolicNetwork /> {/* Use modularized metabolic network section */}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Content;
