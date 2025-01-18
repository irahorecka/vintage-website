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
        Yeast metabolism reveals how cells endure stress through backup
        systems—much like our own. These systems activate to safeguard vital
        processes during failure, ensuring survival. Understanding them drives
        advancements in disease treatment and the development of new therapies.
      </p>
    </div>
  );
};

export default MetabolicNetwork;
