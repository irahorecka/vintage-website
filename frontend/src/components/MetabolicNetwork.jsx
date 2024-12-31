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
        Exploring metabolism in yeast reveals how systems adapt under stress,
        uncovering intricate backup mechanisms that sustain life.
      </p>
      <p>
        These discoveries not only deepen our understanding of cellular
        resilience but also play an important role in advancing medical research
        and drug discovery.
      </p>
    </div>
  );
};

export default MetabolicNetwork;
