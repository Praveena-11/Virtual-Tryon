import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:4000';

export default function TryOn() {
  const { id }      = useParams();
  const navigate    = useNavigate();

  const [dress,         setDress]         = useState(null);
  const [personFile,    setPersonFile]    = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [status,        setStatus]        = useState('');
  const [error,         setError]         = useState('');
  const [recs,          setRecs]          = useState([]);
  const [messages,      setMessages]      = useState([
    { role: 'bot', text: '👋 Hi! I am your personal stylist. Complete your try-on and I will suggest matching accessories!' }
  ]);
  const [chatInput,  setChatInput]  = useState('');
  const messagesEndRef = useRef(null);

  // Load dress
  useEffect(() => {
    axios.get(`${API}/api/dresses/${id}`)
      .then(r => setDress(r.data.data))
      .catch(() => navigate('/gallery'));
  }, [id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleTryOn = async () => {
    if (!personFile) { setError('Please upload your photo first!'); return; }
    setLoading(true);
    setError('');
    setResult(null);

    const steps = [
      'Uploading your photo...',
      'Analyzing body pose...',
      'Processing garment...',
      'Applying outfit with AI...',
      'Enhancing result...',
    ];
    let i = 0;
    setStatus(steps[0]);
    const interval = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1);
      setStatus(steps[i]);
    }, 5000);

    try {
      const form = new FormData();
      form.append('person_image', personFile);
      form.append('dress_id', id);

      const res = await axios.post(`${API}/api/tryon`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000
      });

      clearInterval(interval);
      setResult(res.data.result_image);
      setStatus('');

      const recRes = await axios.post(`${API}/api/chat/recommendations`, { dress_id: id });
      setRecs(recRes.data.data);

      setMessages(prev => [...prev, {
        role: 'bot',
        text: `🎉 Looking great! Here are accessories I recommend to complete your ${dress?.name} look. Ask me anything!`
      }]);

    } catch (err) {
      clearInterval(interval);
      setStatus('');
      const msg = err.response?.data?.message || err.message || 'Try-on failed';
      if (err.response?.data?.retry) {
        setError(msg + ' — Wait 30 seconds and click Try Again (model is warming up).');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    try {
      const res = await axios.post(`${API}/api/chat/ask`, { message: userMsg });
      setMessages(prev => [...prev, {
        role: 'bot',
        text: res.data.reply,
        links: res.data.links
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot', text: 'Sorry, something went wrong. Please try again!'
      }]);
    }
  };

  if (!dress) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading outfit...</p>
    </div>
  );

  return (
    <div className="tryon-page">
      <h1>Virtual Try-On</h1>
      <p>See how <strong style={{color:'var(--rose)'}}>{dress.name}</strong> looks on you</p>

      <div className="tryon-layout">
        {/* Person upload */}
        <div className="panel">
          <h2>📸 Your Photo</h2>
          {personPreview ? (
            <>
              <img src={personPreview} alt="You" />
              <label style={{cursor:'pointer', display:'block', marginTop:'0.8rem'}}>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
                <span className="btn-outline" style={{display:'block', textAlign:'center'}}>🔄 Change Photo</span>
              </label>
            </>
          ) : (
            <label
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <input type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
              <div className="upload-icon">📷</div>
              <strong>Click or drag your photo here</strong>
              <p>Front-facing, full body works best</p>
              <p style={{fontSize:'0.75rem'}}>JPG, PNG · Max 10MB</p>
            </label>
          )}
        </div>

        {/* Dress */}
        <div className="panel">
          <h2>👗 Selected Outfit</h2>
          <img
            src={dress.image}
            alt={dress.name}
            onError={e => { e.target.src = `https://placehold.co/400x380/f0ebe2/c0634a?text=${encodeURIComponent(dress.name)}`; }}
          />
          <div style={{marginTop:'1rem'}}>
            <div style={{fontWeight:600, marginBottom:'0.3rem'}}>{dress.name}</div>
            <div style={{color:'var(--rose)', fontWeight:600, marginBottom:'0.8rem'}}>{dress.price}</div>
            <a href={dress.buyLink} target="_blank" rel="noreferrer" className="buy-link">
              🛍️ Buy on Amazon
            </a>
          </div>
        </div>
      </div>

      <button
        className="process-btn"
        onClick={handleTryOn}
        disabled={loading || !personFile}
      >
        {loading ? `⏳ ${status}` : '✨ Generate Try-On'}
      </button>

      {loading && (
        <div className="status-box">
          <div className="spinner" />
          <p><strong>{status}</strong></p>
          <p style={{marginTop:'0.5rem', fontSize:'0.8rem'}}>
            Takes 15–45 seconds. First request may take up to 60 seconds while the AI model loads.
          </p>
        </div>
      )}

      {error && (
        <div className="error-box">
          ❌ {error}
          <button
            onClick={handleTryOn}
            style={{display:'block', marginTop:'0.8rem', background:'rgba(192,99,74,0.1)', border:'1px solid rgba(192,99,74,0.3)', color:'var(--rose)', borderRadius:'6px', padding:'0.4rem 1rem', cursor:'pointer'}}
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {result && (
        <>
          <div className="result-box">
            <h2>✨ Your Try-On Result</h2>
            <div className="result-images">
              <div className="panel">
                <h2>Before</h2>
                <img src={personPreview} alt="Original" />
              </div>
              <div className="panel">
                <h2>After — {dress.name}</h2>
                <img src={result} alt="Try-on result" />
              </div>
            </div>
            <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
              <a href={dress.buyLink} target="_blank" rel="noreferrer" className="buy-link">🛍️ Amazon</a>
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(dress.name)}`} target="_blank" rel="noreferrer" className="buy-link">🛍️ Flipkart</a>
              <a href={`https://www.myntra.com/${dress.name.replace(/ /g,'-')}`} target="_blank" rel="noreferrer" className="buy-link">🛍️ Myntra</a>
              <a href={result} download="my-tryon.png" className="buy-link" style={{borderColor:'rgba(255,255,255,0.2)', color:'var(--ink)'}}>⬇️ Download</a>
            </div>
          </div>

          <div className="chatbot-section">
            <h2>💡 Styling Recommendations</h2>
            {recs.length > 0 && (
              <div className="recommendations-grid">
                {recs.map((r, i) => (
                  <div className="rec-card" key={i}>
                    <div className="rec-category">{r.category}</div>
                    <div className="rec-item">{r.item}</div>
                    <div className="rec-reason">{r.reason}</div>
                    <div className="rec-price">{r.price}</div>
                    <a href={r.link} target="_blank" rel="noreferrer" className="rec-link">Shop Now →</a>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{marginBottom:'1rem'}}>💬 Ask Your Stylist</h2>
            <div className="chat-box">
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div className={`msg ${m.role}`} key={i}>
                    <div className="msg-bubble">{m.text}</div>
                    {m.links?.length > 0 && (
                      <div className="msg-links">
                        {m.links.map((l, j) => (
                          <a href={l.url} target="_blank" rel="noreferrer" key={j}>{l.label}</a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder="Ask about shoes, bags, jewelry..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                />
                <button className="chat-send" onClick={handleChatSend}>➤</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}