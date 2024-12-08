import React from 'react';
import defaultComic from '../assets/calvin-and-hobbes.png';

const ComicFinder = () => {
  return (
    <div className="comic-finder-container">
      <div className="section-header">
        <h2>Comics Portal</h2>
      </div>
      <div className="comic-finder-text">
        <p>
          I built this comics portal as a side project to make it easy to
          explore classic comic strips. You can search by date to find a
          specific strip or browse randomly for something unexpected. It's
          powered by an API I wrote to handle the queries and keep everything
          running smoothly. Simple, functional, and fun to use.
        </p>
      </div>
      {/* Top Image Container */}
      <div className="comic-image-container">
        <img
          src={defaultComic} // Replace with dynamic comic image
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
