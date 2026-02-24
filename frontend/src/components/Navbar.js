import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">Fashion<span>Vault</span></Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/gallery">Collection</Link>
        <button className="btn-primary" onClick={() => navigate('/gallery')}>Try Now</button>
      </div>
    </nav>
  );
}