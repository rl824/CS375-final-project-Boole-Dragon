import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/deals')
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching deals:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="App"><h2>Loading deals...</h2></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Deal Finder 🔍</h1>
        <p>Find the best deals online!</p>
      </header>

      <div className="deals-container">
        {deals.map(deal => (
          <div key={deal.id} className="deal-card">
            <h3>{deal.title}</h3>
            <p>{deal.description}</p>
            <div className="price-info">
              <span className="current-price">${deal.price}</span>
              <span className="original-price">${deal.originalPrice}</span>
              <span className="discount">
                {Math.round((1 - deal.price / deal.originalPrice) * 100)}% OFF
              </span>
            </div>
            <div className="deal-footer">
              <span className="category">{deal.category}</span>
              <a href={deal.productUrl} target="_blank" rel="noopener noreferrer">
                View Deal
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
