import React, { useEffect, useState } from 'react';
import api from './services/api';

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch data from FastAPI
    api.get('/items/1')
      .then(response => setItems([response.data]))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Items</h1>
      {items.map((item, index) => (
        <div key={index}>
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
