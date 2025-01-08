import React from 'react';

const RetroButton = ({ text, onClick }) => {
  return (
    <button className="retro-button" onClick={onClick}>
      {text}
    </button>
  );
};

export default RetroButton;
