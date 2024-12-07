import React from 'react';
// import './RetroButton.css';

const RetroButton = ({ text, onClick }) => {
    return (
        <button className="retro-button" onClick={onClick}>
        {text}
        </button>
    );
};

export default RetroButton;