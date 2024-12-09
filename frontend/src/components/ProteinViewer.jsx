import React, { useEffect, useState } from 'react';

const ProteinViewer = ({ pdbId }) => {
  const [pdbInfo, setPdbInfo] = useState(null);
  const [uniProtInfo, setUniProtInfo] = useState(null);
  const [pdbeInfo, setPdbeInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMetadataAndViewer = async () => {
      try {
        // Fetch metadata from RCSB
        const metadataUrl = `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`;
        const rcsbResponse = await fetch(metadataUrl);
        if (!rcsbResponse.ok) throw new Error('Failed to fetch RCSB metadata');
        const rcsbData = await rcsbResponse.json();
        setPdbInfo(rcsbData);

        // Fetch UniProt metadata
        const uniProtUrl = `https://rest.uniprot.org/uniprotkb/search?query=${pdbId}&format=json`;
        const uniProtResponse = await fetch(uniProtUrl);
        if (uniProtResponse.ok) {
          const uniProtData = await uniProtResponse.json();
          setUniProtInfo(uniProtData.results?.[0]);
        }

        // Fetch PDBe metadata
        const pdbeUrl = `https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/${pdbId}`;
        const pdbeResponse = await fetch(pdbeUrl);
        if (pdbeResponse.ok) {
          const pdbeData = await pdbeResponse.json();
          setPdbeInfo(pdbeData[pdbId]?.[0]);
        }

        // Initialize 3Dmol.js Viewer
        if (typeof $3Dmol === 'undefined') {
          throw new Error('3Dmol.js is not loaded!');
        }

        const viewer = $3Dmol.createViewer('pymol-viewer', {
          backgroundColor: 'white',
        });
        const pdbUrl = `https://files.rcsb.org/download/${pdbId}.pdb`;

        const pdbResponse = await fetch(pdbUrl);
        if (!pdbResponse.ok) throw new Error('Failed to fetch PDB structure');
        const pdbData = await pdbResponse.text();

        viewer.addModel(pdbData, 'pdb'); // Load the structure
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } }); // Apply style
        viewer.zoomTo(); // Center the molecule
        viewer.render(); // Render the scene
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to fetch data or load structure.');
      }
    };

    fetchMetadataAndViewer();
  }, [pdbId]);

  const getDelineatedSummary = (pdbInfo, uniProtInfo, pdbeInfo) => {
    if (!pdbInfo) return null;

    const title = pdbInfo.struct?.title?.toLowerCase() || 'no title available';
    const method =
      pdbInfo.exptl?.[0]?.method?.toLowerCase() ||
      'unknown experimental method';
    const year = pdbInfo.rcsb_primary_citation?.year || 'N/A';
    const functionDescription =
      uniProtInfo?.proteinDescription?.recommendedName?.fullName?.value?.toLowerCase() ||
      'unknown function';
    const organism =
      pdbInfo.rcsb_entity_source_organism?.[0]?.scientific_name?.toLowerCase() ||
      'organism unknown';
    const pdbeSummary = pdbeInfo?.title?.toLowerCase() || '';

    return {
      proteinName: functionDescription,
      organism,
      title,
      experimentalMethod: method,
      year,
      details: pdbeSummary,
    };
  };

  if (errorMessage) {
    return <p style={{ color: 'red' }}>{errorMessage}</p>;
  }

  if (!pdbInfo) {
    return <p>loading...</p>;
  }

  const summary = getDelineatedSummary(pdbInfo, uniProtInfo, pdbeInfo);

  const capitalize = (text, mode = 'title') => {
    if (!text) return ''; // Handle empty or undefined input

    if (mode === 'title') {
      // Title Case: Capitalize the first letter of each word
      return text
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } else if (mode === 'first') {
      // First Letter Uppercase: Capitalize only the first letter
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    // Default: Return the original text
    return text;
  };

  return (
    <div className="lab-drawing-container">
      {/* Left Panel: Description */}
      <div className="description-container">
        <h3>Protein Database Explorer</h3>
        <p className="two-lines">
          <b>Protein Name:</b> {capitalize(summary.proteinName, 'first')}
        </p>
        <p className="one-line">
          <b>Organism:</b> {capitalize(summary.organism, 'title')}
        </p>
        <p className="two-lines">
          <b>Study Title:</b> {capitalize(summary.title, 'first')}
        </p>
        <p className="two-lines">
          <b>Experimental Method:</b>{' '}
          {capitalize(summary.experimentalMethod, 'title')}
        </p>
        <p className="one-line">
          <b>Year:</b> {summary.year}
        </p>
        <p className="two-lines">
          <b>Additional Details:</b> {capitalize(summary.details, 'first')}
        </p>
      </div>
      {/* Right Panel: 3D Viewer */}
      <div className="viewer-container">
        <div id="pymol-viewer"></div>
      </div>
    </div>
  );
};

export default ProteinViewer;
