import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <ShieldCheck size={18} color="var(--accent-emerald)" />
        <span className="footer-highlight">100% Pemrosesan Lokal di Browser</span>
      </div>
      <p className="footer-text">
        Dokumen dan file Anda tetap berada di perangkat Anda sendiri. Bebas dari server eksternal, cepat, & aman.
      </p>
    </footer>
  );
}
