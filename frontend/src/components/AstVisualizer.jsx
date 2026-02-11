import axios from 'axios';
import { useEffect, useState } from 'react';

const AstVisualizer = () => {
  const [astData, setAstData] = useState(null); // Stores the AST metadata
  const [inputCode, setInputCode] = useState(
    'def fibonacci(n): return n if n <= 1 else fibonacci(n - 1) + fibonacci(n - 2)'
  ); // Default Python expression
  const [isLoading, setIsLoading] = useState(true); // Tracks initial page load
  const [buttonLoading, setButtonLoading] = useState(false); // Tracks button-specific loading
  const [errorMessage, setErrorMessage] = useState(''); // Tracks errors

  // Fetch AST metadata for a default expression on page load
  useEffect(() => {
    const fetchDefaultAst = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `https://irahorecka.com/api/ast/visualize`,
          {
            params: { input_code: inputCode },
          }
        );
        setAstData(response.data);
      } catch (error) {
        console.error('Error fetching default AST:', error);
        setErrorMessage(
          'Failed to load AST visualization. Please check your input.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultAst();
  }, []);

  // Handle submission of user input
  const handleSubmit = async () => {
    try {
      setButtonLoading(true);
      setErrorMessage(''); // Clear previous errors
      const response = await axios.get(
        `https://irahorecka.com/api/ast/visualize`,
        {
          params: { input_code: inputCode },
        }
      );
      setAstData(response.data);
    } catch (error) {
      console.error('Error generating AST:', error);
      setErrorMessage(
        'Failed to load AST visualization. Please check your input.'
      );
    } finally {
      setButtonLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default input behavior
      handleSubmit();
    }
  };

  return (
    <div className="ast-visualizer-container">
      <div className="section-header">
        <h2>Abstract Syntax Tree Visualizer</h2>
      </div>
      <div className="ast-visualizer-text">
        <p>
          Explore Python Abstract Syntax Trees (AST) with a{' '}
          <a
            href="https://github.com/irahorecka/astree"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AST visualization tool repository"
          >
            visualization tool
          </a>{' '}
          I developed. ASTs trace how Python code is parsed and executed. Enter
          a Python expression to see its AST structure.
        </p>
      </div>

      {/* Image Display Area */}
      <div className="ast-image-container">
        {isLoading ? (
          <div className="loading-placeholder">Loading AST...</div>
        ) : (
          <img
            src={`https://irahorecka.com/${astData?.file_path}`}
            alt="Abstract Syntax Tree"
            className="ast-image"
            style={{
              maxWidth: '100%',
              maxHeight: '600px',
              objectFit: 'contain',
            }} // Ensure it fits within the container
          />
        )}
      </div>

      {/* Input and Button Area */}
      <div className="ast-control-bar">
        <input
          type="text"
          className="ast-input"
          placeholder="Enter a Python expression (e.g., x = 3; y = 4; x * y - x ** y)"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          onKeyDown={handleKeyDown} // Trigger submission on Enter
          style={{
            fontSize: '0.9rem',
            fontFamily: 'monospace',
          }}
        />
        <button
          className="ast-button retro-button"
          onClick={handleSubmit}
          disabled={buttonLoading || !inputCode.trim()}
        >
          {buttonLoading ? 'Loading...' : 'Generate AST'}
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>
      )}
    </div>
  );
};

export default AstVisualizer;
