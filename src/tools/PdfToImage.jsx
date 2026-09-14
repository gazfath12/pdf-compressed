import React, { useState } from 'react';
import DropZone from '../components/DropZone';
import ProgressBar from '../components/ProgressBar';
import { convertPdfToImages, exportPagesAsZip } from '../utils/pdfToImage';
import { FileText, Download, FileArchive, RefreshCw, Image as ImageIcon, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PdfToImage() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState([]);
  const [isZipping, setIsZipping] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setPages([]);
    } else {
      alert('Mohon pilih file bertipe PDF (.pdf)');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(5);

    try {
      const res = await convertPdfToImages(file, {
        format,
        scale,
        onProgress: (p) => setProgress(p)
      });
      setPages(res.pages);
      
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      console.error('Convert PDF to Image error:', err);
      alert('Terjadi kesalahan saat mengekstrak halaman PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (page) => {
    const a = document.createElement('a');
    a.href = page.dataUrl;
    a.download = page.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadZip = async () => {
    if (pages.length === 0) return;
    setIsZipping(true);
    try {
      const zipName = `${file.name.replace(/\.[^/.]+$/, '')}_images.zip`;
      const zipBlob = await exportPagesAsZip(pages, zipName);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP error:', err);
      alert('Terjadi kesalahan saat mengunduh ZIP: ' + err.message);
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setProgress(0);
  };

  return (
    <div className="tool-card">
      <div className="tool-header">
        <h2 className="tool-title">Ekstrak PDF ke Gambar PNG/JPG</h2>
        <p className="tool-desc">
          Ubah setiap halaman dokumen PDF Anda menjadi file gambar berkualitas tinggi. 100% diproses langsung di browser Anda.
        </p>
      </div>

      {!file ? (
        <DropZone
          onFilesSelected={handleFileSelect}
          accept="application/pdf"
          title="Tarik & Lepas File PDF Di Sini"
          subtitle="Pilih file PDF yang ingin diubah menjadi gambar"
        />
      ) : (
        <div>
          <div className="file-preview-card">
            <div className="file-info-row">
              <div className="file-details">
                <div className="file-icon">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">File PDF Siap Diekstrak</div>
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

          {pages.length === 0 && (
            <>
              <div className="options-grid">
                <div className="option-group">
                  <label className="option-label">Format Gambar Output:</label>
                  <select
                    className="select-input"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="png">PNG (Tanpa Kompresi, Jernih)</option>
                    <option value="jpg">JPG (Ukuran Ringkas)</option>
                  </select>
                </div>

                <div className="option-group">
                  <label className="option-label">Resolusi & Ketajaman:</label>
                  <select
                    className="select-input"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                  >
                    <option value={1}>1x (Standar)</option>
                    <option value={2}>2x (Tinggi - HD Recommended)</option>
                    <option value={3}>3x (Ultra Sharp - 300 DPI)</option>
                  </select>
                </div>
              </div>

              {isProcessing && <ProgressBar progress={progress} label="Sedang Merender Halaman PDF ke Gambar..." />}

              <button
                className="btn-action"
                onClick={handleConvert}
                disabled={isProcessing}
              >
                <ImageIcon size={20} />
                <span>{isProcessing ? 'Merender Halaman...' : 'Ekstrak Semua Halaman Ke Gambar'}</span>
              </button>
            </>
          )}

          {/* Rendered Gallery & Download Section */}
          {pages.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Hasil Ekstrak ({pages.length} Halaman)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Klik tombol unduh pada halaman tertentu atau unduh semua sekaligus.</p>
                </div>

                <button
                  className="btn-action btn-success"
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  style={{ width: 'auto', margin: 0, padding: '0.75rem 1.25rem' }}
                >
                  <FileArchive size={18} />
                  <span>{isZipping ? 'Membuat Paket ZIP...' : 'Unduh Semua (.ZIP)'}</span>
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="page-gallery-grid">
                {pages.map((pg) => (
                  <div key={pg.pageNumber} className="page-card">
                    <img src={pg.dataUrl} alt={`Halaman ${pg.pageNumber}`} className="page-card-img" />
                    <div className="page-card-meta">
                      <span className="page-number">Hal. {pg.pageNumber}</span>
                      <button
                        className="btn-icon"
                        onClick={() => handleDownloadSingle(pg)}
                        title="Unduh Halaman Ini"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                  className="btn-action"
                  onClick={handleReset}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-main)', display: 'inline-flex', width: 'auto' }}
                >
                  <RefreshCw size={16} />
                  <span>Konversi PDF Lain</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
