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
        Believe it or not, humans share about half of their genes with yeast (~3,000 out of 6,000).
        These genes are essential for core cellular processes that sustain life, making yeast
        an invaluable model for studying human biology.
      </p>
      <p>
        Studying yeast metabolism reveals how cells manage stress through backup systems
        that ensure survival. These mechanisms are key to understanding resilience in more
        complex organisms and drive progress in medical research and drug discovery.
      </p>
    </div>
  );
};

export default MetabolicNetwork;
