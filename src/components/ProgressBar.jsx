import React from 'react';

export default function ProgressBar({ progress, label = "Memproses file..." }) {
  return (
    <div className="progress-container">
      <div className="progress-header">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
