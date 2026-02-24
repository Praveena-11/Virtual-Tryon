import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:4000';

const CATEGORIES = [
  { value: 'all',        label: 'All' },
  { value: 'tshirts',    label: 'T-Shirts' },
  { value: 'kurtis',     label: 'Kurtis' },
  { value: 'shirts',     label: 'Shirts' },
  { value: 'pants',      label: 'Pants' },
  { value: 'dresses',    label: 'Dresses' },
];

export default function Gallery() {
  const [dresses, setDresses]   = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    const url = category !== 'all'
      ? `${API}/api/dresses?category=${category}`
      : `${API}/api/dresses`;

    axios.get(url)
      .then(r => { setDresses(r.data.data); })
      .catch(() => setError('Backend not reachable. Is it running on port 4000?'))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h1>Browse Outfits</h1>
        <p>Pick an outfit to try on</p>
      </div>

      <div className="filter-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            className={`filter-tab ${category === c.value ? 'active' : ''}`}
            onClick={() => setCategory(c.value)}
          >{c.label}</button>
        ))}
      </div>

      {error && <div className="error-box">❌ {error}</div>}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>
      ) : (
        <div className="dress-grid">
          {dresses.map(dress => (
            <div className="dress-card" key={dress.id}>
              <img
                src={dress.image}
                alt={dress.name}
                onError={e => { e.target.src = `https://placehold.co/400x320/1a1a26/c9a84c?text=${encodeURIComponent(dress.name)}`; }}
              />
              <div className="dress-info">
                <h3>{dress.name}</h3>
                <div className="dress-price">{dress.price}</div>
                <div className="dress-tags">
                  {dress.tags.map(t => <span className="tag" key={t}>{t}</span>)}
                </div>
                <button className="try-btn" onClick={() => navigate(`/tryon/${dress.id}`)}>
                  👗 Try This On
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}