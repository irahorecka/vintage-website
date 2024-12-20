import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultComic from '../assets/calvin-and-hobbes.png';

const ComicFinder = () => {
  const [comic, setComic] = useState(null);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [comicName, setComicName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1); // Track active suggestion
  const [isClearing, setIsClearing] = useState(false); // State to handle animation

  const fetchComic = async (type) => {
    try {
      const params = {
        comic: comicName,
        ...(type === 'search' && date ? { date } : {}),
      };
      const response = await axios.get(
        'http://localhost:8000/api/comics/search',
        { params }
      );
      setComic(response.data.file_path); // Update with the file path
    } catch (error) {
      console.error('Error fetching comic:', error);
      alert(
        'Failed to fetch the comic. Please check your inputs or try again.'
      );
    }
  };

  const fetchSuggestions = async (input) => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/comics/fuzzy-search',
        {
          params: { comic_name: input },
        }
      );
      setSuggestions(response.data.matches.map((match) => ({ name: match }))); // Map matches
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && activeIndex !== -1) {
      setComicName(suggestions[activeIndex].name);
      clearSuggestions();
      e.target.blur();
    }
  };

  const clearSuggestions = () => {
    setIsClearing(true);
    setTimeout(() => {
      setSuggestions([]);
      setIsClearing(false);
    }, 300); // Match the CSS transition duration
  };

  useEffect(() => {
    if (comicName.length > 0) {
      fetchSuggestions(comicName);
    } else {
      clearSuggestions();
    }
  }, [comicName]);

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
          src={comic ? `http://localhost:8000/${comic}` : defaultComic}
          alt="Comic Display"
          className="comic-image"
        />
      </div>

      {/* Bottom Control Bar */}
      <div className="comic-control-bar">
        <div style={{ position: 'relative', flex: 2 }}>
          <input
            type="text"
            className="comic-search-input"
            placeholder="Search for a comic..."
            value={comicName}
            onChange={(e) => {
              setComicName(e.target.value);
              if (e.target.value.trim().length > 0) {
                setActiveIndex(-1);
                fetchSuggestions(e.target.value);
              } else {
                setSuggestions([]);
              }
            }}
            onFocus={() => {
              if (comicName.trim().length > 0) fetchSuggestions(comicName);
            }}
            onBlur={(e) => {
              // Allow time for selection clicks before clearing suggestions
              if (!e.relatedTarget || e.relatedTarget.tagName !== 'LI') {
                setTimeout(() => setSuggestions([]), 150);
              }
            }}
            onKeyDown={handleKeyDown}
          />
          {suggestions.length > 0 && (
            <div
              className={`suggestions-dropdown ${isClearing ? 'fade-out' : 'fade-in'}`}
            >
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={activeIndex === index ? 'active' : ''}
                    onClick={() => {
                      setComicName(suggestion.name);
                      clearSuggestions();
                    }}
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <input
          type="date"
          className="comic-date-picker"
          placeholder="Pick a date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          className="comic-button retro-button"
          onClick={() => fetchComic('search')}
        >
          Search by Date
        </button>
        <button
          className="comic-button retro-button"
          onClick={() => fetchComic('random')}
        >
          Random Date
        </button>
      </div>
    </div>
  );
};

export default ComicFinder;
