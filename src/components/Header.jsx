import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <a href="#" className="logo">
          <div className="logo-icon">
            <FileText size={24} />
          </div>
          <span>PDF<span style={{ color: 'var(--primary)' }}>Forge</span></span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: '600' }}>
          <ShieldCheck size={18} />
          <span>Privasi Lokal 100%</span>
        </div>
      </div>
    </header>
  );
}
