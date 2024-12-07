import React from 'react';
import Sidebar from './Sidebar';
import ComicFinder from './ComicFinder'; // Import the new component
import ProfileSection from './ProfileSection';
import MetabolicNetwork from './MetabolicNetwork';
import ContentRow from './ContentRow';

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
            <h1>A point in every direction is the same as having no point at all.</h1>
            <h1>—Harry Nilsson</h1>
          </div>
          <div className="year-background">2024</div>
          <div className="date-banner">{getCurrentDate()}</div>
        </section>

        {/* Dual Content Row */}
        <ContentRow
          leftContent={<ProfileSection />}
          rightContent={<MetabolicNetwork />}
          topBorder={true}
          bottomBorder={true}
        />
        
        <div className="whats-hot-container left-content">
          <div className="whats-hot-box">What's Hot</div>
          <div className="red-line"></div>
        </div>

        {/* Single Content Row (Duplicate Height but Single Content) */}
        <ContentRow
          leftContent={<ComicFinder />}
          singleColumn={true}
        />
        
      </main>
    </div>
  );
}

export default Content;
