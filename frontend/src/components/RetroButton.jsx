import React from 'react';
import './RetroButton.css';

const RetroButton = ({ text }) => {
  return (
    <button className="retro-button">{text}</button>
  );
};

export default RetroButton;
