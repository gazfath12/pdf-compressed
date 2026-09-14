import React, { useState } from 'react';
import Header from './components/Header';
import PrivacyBadge from './components/PrivacyBadge';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PdfCompressor from './tools/PdfCompressor';
import ImageToPdf from './tools/ImageToPdf';
import PdfToImage from './tools/PdfToImage';

export default function App() {
  const [activeTool, setActiveTool] = useState('compress');

  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
        <PrivacyBadge />

        <Navbar activeTool={activeTool} setActiveTool={setActiveTool} />

        {activeTool === 'compress' && <PdfCompressor />}
        {activeTool === 'img-to-pdf' && <ImageToPdf />}
        {activeTool === 'pdf-to-img' && <PdfToImage />}
      </main>

      <Footer />
    </div>
  );
}
