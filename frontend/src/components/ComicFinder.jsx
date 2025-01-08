/*
  Disclaimer: This project displays comics retrieved from an external source for personal and educational purposes only.
  I do not claim ownership of the comics or their content. All rights belong to their respective creators and copyright holders.
*/
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ComicFinder = () => {
  const [comic, setComic] = useState(''); // Default empty state
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // 'en-CA' gives an ISO-like format: YYYY-MM-DD
  });
  const [comicName, setComicName] = useState('Calvin and Hobbes'); // Default comic name
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [buttonLoading, setButtonLoading] = useState({
    search: false,
    random: false,
  }); // Button-specific loading states
  const [imageHeight, setImageHeight] = useState(null); // Track the image height
  const imgRef = useRef(null); // Reference to the image
  const hasFetchedInitial = useRef(false); // Prevent double fetch on page load

  const fetchComic = async (type, isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setButtonLoading((prev) => ({ ...prev, [type]: true }));
    }

    try {
      const params = {
        comic: comicName,
        ...(type === 'search' && date ? { date } : {}),
      };
      const response = await axios.get(
        'https://irahorecka.com/api/comics/search',
        { params }
      );
      setComic(response.data.file_path);
    } catch (error) {
      console.error('Error fetching comic for date:', error);
      // Perform a random search as a fallback
      try {
        const response = await axios.get(
          'https://irahorecka.com/api/comics/search',
          { params: { comic: comicName } }
        );
        setComic(response.data.file_path);
      } catch (randomError) {
        console.error('Error fetching random comic as fallback:', randomError);
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setButtonLoading((prev) => ({ ...prev, [type]: false }));
      }
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
      setSuggestions(response.data.matches.map((match) => ({ name: match })));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setComicName(value);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout); // Clear previous timeout to avoid multiple triggers
    }

    if (value.trim().length > 0) {
      const newTimeout = setTimeout(() => {
        fetchSuggestions(value); // Trigger search after delay
      }, 100); // 300ms delay
      setDebounceTimeout(newTimeout); // Store the new timeout
    } else {
      clearSuggestions(); // Clear suggestions if input is empty
    }
  };

  useEffect(() => {
    if (!hasFetchedInitial.current) {
      fetchComic('search', true); // Explicitly mark this as an initial load
      hasFetchedInitial.current = true;
    }
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
            onChange={handleInputChange}
            onFocus={() => {
              if (comicName.trim().length > 0) fetchSuggestions(comicName);
            }}
            onBlur={(e) => {
              if (!e.relatedTarget || e.relatedTarget.tagName !== 'LI') {
                setTimeout(() => clearSuggestions(), 150); // Clear suggestions after focus loss
              }
            }}
          />
          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setComicName(suggestion.name); // Set the clicked suggestion as the input value
                      clearSuggestions(); // Clear the suggestions immediately
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
          {buttonLoading.search ? 'Loading...' : 'Search by Date'}
        </button>
        <button
          className="comic-button retro-button"
          onClick={() => fetchComic('random')}
        >
          {buttonLoading.random ? 'Loading...' : 'Random Date'}
        </button>
      </div>
    </div>
  );
};

export default ComicFinder;
