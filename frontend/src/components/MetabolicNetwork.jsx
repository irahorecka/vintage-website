import React from 'react';
import metabolicNetwork from '../assets/metabolic-network.gif';

const MetabolicNetwork = () => {
  return (
    <div className="feature-box">
      <img
        src={metabolicNetwork}
        alt="Yeast Metabolic Network"
        className="right-sidebar-image"
      />
      <h3>
        <i>S. cerevisiae</i>
      </h3>
      <p>The Metabolic Network in 3D!</p>
      <p>
        Believe it or not, we share about half of all genes found in baker's
        yeast (~3,000 of 6,000), making us surprisingly alike.
      </p>
      <p>
        Exploring metabolism in yeast through gene deletions reveals how systems
        adapt when broken. This helps us understand complex backup mechanisms
        within cells and highlights vulnerabilities that could serve as
        potential therapeutic targets.
      </p>
    </div>
  );
};

export default MetabolicNetwork;
