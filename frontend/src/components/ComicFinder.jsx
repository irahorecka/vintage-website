import React from 'react';

const ComicFinder = () => {
  return (
    <div className="comic-finder-container">
      {/* Top Image Container */}
      <div className="comic-image-container">
        <img
          src="https://via.placeholder.com/1000x400" // Replace with dynamic comic image
          alt="Comic Display"
          className="comic-image"
        />
      </div>

      {/* Bottom Control Bar */}
      <div className="comic-control-bar">
        <input
          type="text"
          className="comic-search-input"
          placeholder="Search for a comic..."
        />
        <input
          type="date"
          className="comic-date-picker"
          placeholder="Pick a date"
        />
        <button className="comic-button retro-button">Search by Date</button>
        <button className="comic-button retro-button">Random Date</button>
      </div>
    </div>
  );
};

export default ComicFinder;
