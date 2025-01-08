import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AstVisualizer = () => {
  const [astData, setAstData] = useState(null); // Stores the AST metadata
  const [inputCode, setInputCode] = useState(
    'for i in range(42): j = i ** 2;print(f"{i} squared is {j}")'
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
          'Failed to load AST visualization or metadata. Please check your input.'
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
      setErrorMessage('Failed to load PDB structure or metadata.');
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
          Explore Python Abstract Syntax Trees (AST) effortlessly with this
          visualization tool. ASTs break down Python code into a tree structure,
          helping you understand how the code is parsed and executed. Just enter
          a Python expression to see its AST structure come to life. Learn more
          about the AST visualization library I developed on{' '}
          <a href="https://github.com/irahorecka/astree">GitHub</a>.
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
              maxHeight: '500px',
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
