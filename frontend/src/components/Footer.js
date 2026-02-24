import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            Fashion Vault 
            <p>AI-powered virtual try-on. See how outfits look on you before you buy — no returns, no guessing.</p>
          </div>
          <div className="footer-links">
            <h4>Navigate</h4>
            <Link to="/">Home</Link>
            <Link to="/gallery">Browse Collection</Link>
          </div>
          <div className="footer-links">
            <h4>Shop Online</h4>
            <a href="https://myntra.com" target="_blank" rel="noreferrer">Myntra</a>
            <a href="https://flipkart.com" target="_blank" rel="noreferrer">Flipkart</a>
            <a href="https://amazon.in" target="_blank" rel="noreferrer">Amazon India</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 Fashion Vault  Virtual Try-On · Made in India 🇮🇳 · All rights reserved
        </div>
      </div>
    </footer>
  );
}