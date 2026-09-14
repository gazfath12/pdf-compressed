import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

export default function PrivacyBadge() {
  return (
    <div className="privacy-banner">
      <div className="privacy-banner-left">
        <div className="privacy-icon-wrapper">
          <Lock size={20} />
        </div>
        <div>
          <div className="privacy-title">Jaminan Keamanan & Privasi 100%</div>
          <div className="privacy-subtitle">
            Seluruh proses dilakukan di dalam browser komputer Anda. File **TIDAK PERNAH DIUNGGAH** ke server mana pun.
          </div>
        </div>
      </div>
      <div className="privacy-chip">
        Offline & Browser Local
      </div>
    </div>
  );
}
