import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import TryOn from './pages/TryOn';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/gallery"   element={<Gallery />} />
        <Route path="/tryon/:id" element={<TryOn />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}