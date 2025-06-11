import { useEffect, useState } from 'react';

import _ from 'lodash';

const capitalize = (text = '', mode = 'title', exceptions = []) => {
  const isAllUpper = (word) => word === word.toUpperCase(); // Detect fully uppercase words

  switch (mode) {
    case 'title':
      return text
        .split(' ')
        .map((word) => {
          const upperWord = word.toUpperCase();

          if (exceptions.includes(upperWord)) {
            return upperWord; // Keep exceptions fully uppercase
          }

          if (isAllUpper(word)) {
            // Convert fully uppercase words to title case
            return _.capitalize(word.toLowerCase());
          }

          return _.capitalize(word); // General case: capitalize first letter
        })
        .join(' ');
    case 'first':
      return _.capitalize(text.toLowerCase());
    default:
      return text;
  }
};

const initializeViewer = (containerId, pdbData) => {
  const viewerContainer = document.getElementById(containerId);
  if (!viewerContainer) throw new Error('3Dmol.js viewer container not found');

  const viewer = $3Dmol.createViewer(viewerContainer, {
    backgroundColor: 'white',
  });
  viewer.addModel(pdbData, 'pdb');
  viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
  viewer.zoomTo();
  viewer.render();
  // Disable scroll zoom by preventing wheel events
  viewerContainer.addEventListener(
    'wheel',
    (event) => {
      event.stopPropagation(); // Stop the event from reaching 3Dmol
      event.preventDefault(); // Prevent the default zoom behavior
    },
    { passive: false, capture: true } // Captures event *before* 3Dmol.js can act on it
  );
};

const ProteinViewer = () => {
  const [pdbId, setPdbId] = useState('6MP4');
  const [query, setQuery] = useState('');
  const [pdbInfo, setPdbInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(true);

  useEffect(() => {
    if (!pdbId) return;

    const fetchAndDisplayProtein = async () => {
      try {
        if (!pdbInfo) setViewerLoading(true); // Start viewer loading

        const response = await fetch(
          `https://irahorecka.com/api/protein?keyword=${pdbId}`
        );
        const data = await response.json();

        if (!data || !data.metadata) {
          throw new Error('Failed to fetch metadata from the backend.');
        }

        const metadata = data.metadata;
        const pdbIdFromBackend = metadata.pdb_id;
        const pdbFileUrl = `https://files.rcsb.org/download/${pdbIdFromBackend}.pdb`;

        const pdbData = await fetch(pdbFileUrl).then((res) => {
          if (!res.ok) throw new Error('Failed to fetch PDB structure file.');
          return res.text();
        });

        setPdbInfo(metadata);
        initializeViewer('pymol-viewer', pdbData);
        setErrorMessage('');
      } catch (error) {
        console.error('Error fetching or displaying protein data:', error);
        setErrorMessage('Failed to load PDB structure or metadata.');
      } finally {
        setViewerLoading(false); // Stop viewer loading
      }
    };

    fetchAndDisplayProtein();
  }, [pdbId]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Call the Flask backend to get the first PDB ID for the query
      const response = await fetch(
        `https://irahorecka.com/api/protein?keyword=${query}`
      );
      const data = await response.json();

      if (!data || !data.pdb_id) {
        throw new Error('No PDB ID found for the given keyword.');
      }

      // Set the PDB ID returned from the backend
      setPdbId(data.pdb_id.toUpperCase());
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching PDB ID from backend:', error);
      setErrorMessage('Failed to fetch PDB ID or metadata from the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSummary = () => {
    const getSafeValue = (obj, path, defaultValue = 'N/A') =>
      path.reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue),
        obj
      );

    const summary = pdbInfo
      ? {
          pdbId: getSafeValue(pdbInfo, ['pdb_id'], 'N/A'),
          proteinName: getSafeValue(
            pdbInfo,
            ['protein_name'],
            'No protein name available'
          ),
          experimentalMethod: getSafeValue(
            pdbInfo,
            ['experimental_method'],
            'Unknown experimental method'
          ),
          resolution:
            getSafeValue(pdbInfo, ['resolution'], 'Not available') + ' Å',
          year: getSafeValue(pdbInfo, ['year'], 'N/A'),
          authors: getSafeValue(pdbInfo, ['authors'], []),
          keywords: getSafeValue(
            pdbInfo,
            ['keywords'],
            'No keywords available'
          ),
        }
      : {
          pdbId: 'Loading...',
          proteinName: 'Loading...',
          experimentalMethod: 'Loading...',
          resolution: 'Loading...',
          year: 'Loading...',
          authors: [], // Always an array, even during loading
          keywords: 'Loading...',
        };

    return (
      <div className="card-container">
        <div className="card-body">
          <p className="one-line">
            <b>PDB ID: </b> {summary.pdbId}
          </p>
          <p className="three-lines">
            <b>Protein Name: </b> {summary.proteinName}
          </p>
          <p className="two-lines">
            <b>Class: </b> {capitalize(summary.keywords, 'title')}
          </p>
          <p className="two-lines">
            <b>Experimental Method: </b>{' '}
            {capitalize(summary.experimentalMethod, 'title')}
          </p>
          <p className="one-line">
            <b>Resolution: </b>{' '}
            {summary.resolution ? summary.resolution : 'Not available'}
          </p>
          <p className="one-line">
            <b>Year: </b> {summary.year}
          </p>
          <p className="two-lines">
            <b>Authors: </b>{' '}
            {summary.authors.length > 0
              ? summary.authors.join(', ')
              : 'No authors available'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="protein-explorer-container">
      <div className="description-container">
        <h3>
          Explore <i>Millions</i> of Proteins
        </h3>
        <p>
          Genes act as blueprints for molecular machines called proteins.
          Explore detailed 3D protein structures from{' '}
          <a href="https://www.rcsb.org/">RCSB Protein Data Bank</a>.
        </p>
        <div className="query-control-bar">
          <input
            type="text"
            className="query-search-input"
            placeholder="Enter keywords (e.g., lactase)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            aria-label="Enter keyword"
          />
          <button
            className="query-button retro-button"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
        </div>
        {renderSummary()}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>

      <div className="viewer-container">
        <div id="pymol-viewer">
          {viewerLoading && (
            <div className="loading-text">Loading viewer...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProteinViewer;
