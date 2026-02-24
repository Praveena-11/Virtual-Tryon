import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">✨ AI-Powered Virtual Try-On</div>
          <h1>Wear It Before<br />You <em>Buy It</em></h1>
          <p>
            Upload your photo, pick any outfit from our collection, and see
            exactly how it looks on you — powered by AI. No guessing, no returns.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/gallery')}>Browse Collection</button>
            <button className="btn-outline" onClick={() => navigate('/gallery')}>How It Works</button>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why Fashion Vault?</h2>
        <p className="section-sub">The smartest way to shop for fashion in India</p>
        <div className="features-grid">
          {[
            { icon:'🤖', title:'Realistic AI Try-On',   desc:'Powered by IDM-VTON diffusion model. Not just an overlay — sees your body shape and drapes the outfit realistically.' },
            { icon:'⚡', title:'Fast Results',           desc:'Get your try-on result in under 60 seconds. Works on any device without any app download.' },
            { icon:'🛍️', title:'Shop on Myntra & More', desc:'Every outfit links directly to Myntra, Flipkart and Amazon India so you can buy instantly at the best price.' },
            { icon:'💬', title:'Styling Assistant',      desc:'Our AI stylist suggests matching footwear, jewellery and bags to complete your look.' },
            { icon:'🔒', title:'Privacy First',          desc:'Your photos are never stored. Processed in real-time and immediately discarded after your session.' },
            { icon:'👗', title:'Indian Fashion Focus',   desc:'Kurtas, anarkalis, indo-western fusion and more — curated for Indian body types and fashion sensibilities.' },
          ].map((f,i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Three steps to your perfect outfit</p>
        <div className="steps">
          {[
            { n:'1', title:'Browse Collection',   desc:'Explore kurtas, anarkalis, dresses and more from our curated Indian fashion collection.' },
            { n:'2', title:'Upload Your Photo',   desc:'Take a clear front-facing photo in good lighting. Full body works best.' },
            { n:'3', title:'See the Magic',       desc:'AI generates your try-on in seconds. Then shop directly on Myntra or Flipkart!' },
          ].map((s,i) => (
            <div className="step" key={i}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}