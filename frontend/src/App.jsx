import React from 'react';
import './styles/reset.css';
import './styles/vintage.css';
import Sidebar from './components/Sidebar';
import Content from './components/Content';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <Content />
    </div>
  );
}

export default App;
