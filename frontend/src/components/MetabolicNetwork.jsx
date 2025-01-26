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
        Believe it or not, yeast shares about half of its genes with humans
        (~3,000 out of 6,000). These genes are essential for core cellular
        processes that sustain life, making yeast an invaluable model for
        studying human biology.
      </p>
      <p>
        Yeast metabolism reveals how cells survive stress with backup systems,
        much like ours. These systems protect vital processes during failure,
        ensuring survival. Exploring them bridges fundamental biology with
        advances in disease treatment and therapies.
      </p>
    </div>
  );
};

export default MetabolicNetwork;
