import React from 'react';
import { Minimize2, Image, FileImage } from 'lucide-react';

export default function Navbar({ activeTool, setActiveTool }) {
  const tools = [
    {
      id: 'compress',
      label: 'Kompres PDF',
      icon: Minimize2,
      desc: 'Kecilkan ukuran file PDF'
    },
    {
      id: 'img-to-pdf',
      label: 'Gambar ke PDF',
      icon: Image,
      desc: 'Ubah JPG / PNG ke PDF'
    },
    {
      id: 'pdf-to-img',
      label: 'PDF ke Gambar',
      icon: FileImage,
      desc: 'Ekstrak halaman PDF jadi JPG/PNG'
    }
  ];

  return (
    <nav className="nav-tabs">
      {tools.map(tool => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
          >
            <Icon size={20} />
            <span>{tool.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
