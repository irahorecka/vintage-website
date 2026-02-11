import PropTypes from 'prop-types';

const RetroButton = ({ text, onClick }) => {
  return (
    <button className="retro-button" onClick={onClick}>
      {text}
    </button>
  );
};

RetroButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default RetroButton;
