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
        <i>Saccharomyces cerevisiae</i>
      </h3>
      <p>Baker's Yeast Metabolism in 3D!</p>
      <p>
        Believe it or not, we share about half of all genes found in yeast
        (~3,000 of 6,000), making us surprisingly alike.
      </p>
      <p>
        Exploring yeast metabolism reveals how cells manage stress through
        backup mechanisms that sustain life, providing insights into resilience
        seen in complex organisms.
      </p>
      <p>
        Such findings advance our understanding of basic biology and drive
        progress in medical research and drug discovery.
      </p>
    </div>
  );
};

export default MetabolicNetwork;
