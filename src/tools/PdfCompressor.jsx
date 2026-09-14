import React, { useState } from 'react';
import DropZone from '../components/DropZone';
import ProgressBar from '../components/ProgressBar';
import { compressPdfFile, formatBytes } from '../utils/pdfCompressor';
import { FileText, Download, RefreshCw, Zap, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PdfCompressor() {
  const [file, setFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Mohon pilih file bertipe PDF (.pdf)');
    }
  };

  const handleStartCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(5);

    try {
      const res = await compressPdfFile(file, {
        level: compressionLevel,
        onProgress: (p) => setProgress(p)
      });
      setResult(res);
      
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if confetti fails
      }
    } catch (err) {
      console.error('Compress error:', err);
      alert('Terjadi kesalahan saat mengompres PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="tool-card">
      <div className="tool-header">
        <h2 className="tool-title">Kompres Ukuran File PDF</h2>
        <p className="tool-desc">
          Kecilkan file PDF yang besar menjadi lebih ringan tanpa kehilangan kualitas keterbacaan teks. 100% diproses secara lokal di komputer Anda.
        </p>
      </div>

      {!file ? (
        <DropZone
          onFilesSelected={handleFileSelect}
          accept="application/pdf"
          title="Tarik & Lepas File PDF Di Sini"
          subtitle="atau pilih file PDF dari penyimpanan lokal komputer Anda"
        />
      ) : (
        <div>
          {/* File Selected Card */}
          <div className="file-preview-card">
            <div className="file-info-row">
              <div className="file-details">
                <div className="file-icon">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">Ukuran Asli: {formatBytes(file.size)}</div>
                </div>
              </div>
              <button
                className="btn-icon btn-icon-danger"
                onClick={handleReset}
                title="Ganti File"
                disabled={isProcessing}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Compression Level Options */}
          {!result && (
            <>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="option-label" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={16} color="var(--primary)" />
                  <span>Pilih Tingkat Kompresi:</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div
                    onClick={() => setCompressionLevel('extreme')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${compressionLevel === 'extreme' ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: compressionLevel === 'extreme' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Ekstrem</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Ukuran Paling Kecil</div>
                  </div>

                  <div
                    onClick={() => setCompressionLevel('recommended')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${compressionLevel === 'recommended' ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                      background: compressionLevel === 'recommended' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Rekomendasi</span>
                      <CheckCircle2 size={16} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Kualitas & Ukuran Seimbang</div>
                  </div>

                  <div
                    onClick={() => setCompressionLevel('low')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${compressionLevel === 'low' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      background: compressionLevel === 'low' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Ringan</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Kualitas Gambar Tinggi</div>
                  </div>
                </div>
              </div>

              {isProcessing && <ProgressBar progress={progress} label="Sedang Mengompres Halaman PDF..." />}

              <button
                className="btn-action"
                onClick={handleStartCompress}
                disabled={isProcessing}
              >
                <Zap size={20} />
                <span>{isProcessing ? 'Proses Kompresi Berlangsung...' : 'Kompres PDF Sekarang'}</span>
              </button>
            </>
          )}

          {/* Results Box */}
          {result && (
            <div className="result-card">
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                🎉 PDF Berhasil Dikompres!
              </div>

              <div className="result-stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Sebelum</span>
                  <span className="stat-value">{formatBytes(result.originalSize)}</span>
                </div>
                <div className="stat-box" style={{ justifyContent: 'center' }}>
                  <ArrowRight size={24} color="var(--accent-emerald)" />
                </div>
                <div className="stat-box">
                  <span className="stat-label">Sesudah</span>
                  <span className="stat-value savings">{formatBytes(result.compressedSize)}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '1.25rem' }}>
                Hemat Ukuran Penyimpanan Hingga {result.savingsPercent}%
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-action btn-success"
                  onClick={handleDownload}
                  style={{ flex: 1, marginTop: 0 }}
                >
                  <Download size={20} />
                  <span>Unduh File PDF Dikompres</span>
                </button>

                <button
                  className="btn-action"
                  onClick={handleReset}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-main)', marginTop: 0, width: 'auto' }}
                >
                  <RefreshCw size={18} />
                  <span>Kompres PDF Lain</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
