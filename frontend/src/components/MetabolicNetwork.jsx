import React from 'react';
import metabolicNetwork from '../assets/metabolic-network.gif';
// import '../styles/vintage.css';

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
    </div>
  );
};

export default MetabolicNetwork;
