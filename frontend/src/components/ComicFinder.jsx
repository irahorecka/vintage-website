import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ComicFinder = () => {
  const [comic, setComic] = useState('Calvin and Hobbes'); // Default comic
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // 'en-CA' gives an ISO-like format: YYYY-MM-DD
  });
  const [comicName, setComicName] = useState(comic);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false); // State to handle animation
  const [imageHeight, setImageHeight] = useState(null); // Track the image height
  const imgRef = useRef(null); // Reference to the image

  const fetchComic = async (type) => {
    try {
      setIsLoading(true); // Start loading
      const params = {
        comic: comicName,
        ...(type === 'search' && date ? { date } : {}),
      };
      const response = await axios.get(
        'https://irahorecka.com/api/comics/search',
        { params }
      );
      setComic(response.data.file_path); // Update with the file path
    } catch (error) {
      console.error('Error fetching comic for date:', error);
      // Perform a random search as a fallback
      try {
        const response = await axios.get(
          'https://irahorecka.com/api/comics/search',
          { params: { comic: comicName } } // Adjust to random fetch logic if needed
        );
        setComic(response.data.file_path); // Update with the file path
      } catch (randomError) {
        console.error('Error fetching random comic as fallback:', randomError);
      }
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const fetchSuggestions = async (input) => {
    try {
      const response = await axios.get(
        'https://irahorecka.com/api/comics/fuzzy-search',
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

  const clearSuggestions = () => {
    setIsClearing(true);
    setTimeout(() => {
      setSuggestions([]);
      setIsClearing(false);
    }, 300); // Match the CSS transition duration
  };

  useEffect(() => {
    if (comicName !== comic && comicName.length > 0) {
      fetchSuggestions(comicName);
    } else {
      clearSuggestions();
    }
  }, [comicName]); // Fetch suggestions when comicName changes

  useEffect(() => {
    fetchComic('search');
  }, []); // Fetch today's Calvin and Hobbes comic on initial render

  useEffect(() => {
    if (imgRef.current) {
      // Update the height dynamically when the image is rendered
      setImageHeight(imgRef.current.offsetHeight);
    }
  }, [comic]); // Update whenever the comic changes

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
          powered by an <a href="https://github.com/irahorecka/comics">API</a> I
          wrote to handle the queries and keep everything running smoothly.
          Simple, functional, and fun to use!
        </p>
      </div>

      {/* Top Image Container */}
      <div className="comic-image-container" style={{ position: 'relative' }}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: imageHeight || '30vh', // Default height if not yet determined
              fontSize: '1.2rem',
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: '#5f5f5f',
            }}
          >
            Loading comic...
          </div>
        ) : (
          <img
            ref={imgRef} // Attach ref to the image
            src={`https://irahorecka.com/${comic}`}
            alt="Comic Display"
            className="comic-image"
            style={{ objectFit: 'contain' }}
          />
        )}
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
          />
          {suggestions.length > 0 && (
            <div
              className={`suggestions-dropdown ${isClearing ? 'fade-out' : 'fade-in'}`}
            >
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
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
