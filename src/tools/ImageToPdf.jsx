import React, { useState } from 'react';
import DropZone from '../components/DropZone';
import ProgressBar from '../components/ProgressBar';
import { convertImagesToPdf } from '../utils/imageToPdf';
import { Image as ImageIcon, Download, Trash2, ArrowUp, ArrowDown, FilePlus, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ImageToPdf() {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState('small');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState(null);

  const handleFilesSelect = (newFiles) => {
    const selectedArray = Array.isArray(newFiles) ? newFiles : [newFiles];
    const validImages = selectedArray.filter(file => file.type.startsWith('image/'));

    if (validImages.length === 0) {
      alert('Mohon pilih file gambar (.jpg, .png, .webp)');
      return;
    }

    // Add object preview URLs
    const formatted = validImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(2, 9)
    }));

    setImages(prev => [...prev, ...formatted]);
    setResultBlob(null);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const handleRemove = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(5);

    try {
      const rawFiles = images.map(img => img.file);
      const res = await convertImagesToPdf(rawFiles, {
        pageSize,
        orientation,
        margin,
        onProgress: (p) => setProgress(p)
      });
      setResultBlob(res);
      
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      console.error('Convert images error:', err);
      alert('Terjadi kesalahan saat mengonversi gambar ke PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultBlob.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-card">
      <div className="tool-header">
        <h2 className="tool-title">Ubah Gambar ke File PDF</h2>
        <p className="tool-desc">
          Gabungkan beberapa gambar (JPG, PNG, WEBP) menjadi satu dokumen PDF yang rapi dengan tata letak yang dapat disesuaikan.
        </p>
      </div>

      <DropZone
        onFilesSelected={handleFilesSelect}
        accept="image/*"
        multiple={true}
        title="Tarik & Lepas Gambar Di Sini"
        subtitle="Dapat memilih beberapa gambar JPG, PNG, atau WEBP sekaligus"
      />

      {images.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
              Daftar Gambar ({images.length} File)
            </div>
            <button
              className="btn-select-files"
              onClick={() => document.querySelector('input[type="file"]').click()}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <FilePlus size={14} />
              <span>Tambah Gambar</span>
            </button>
          </div>

          {/* Grid Preview of Selected Images */}
          <div className="image-list-grid">
            {images.map((img, idx) => (
              <div key={img.id} className="image-thumb-card">
                <img src={img.preview} alt={`Page ${idx + 1}`} className="image-thumb-preview" />
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Halaman {idx + 1}
                </div>
                <div className="image-thumb-controls">
                  <button
                    className="btn-icon"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    title="Pindah Ke Atas / Kiri"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === images.length - 1}
                    title="Pindah Ke Bawah / Kanan"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleRemove(img.id)}
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Layout Options */}
          <div className="options-grid">
            <div className="option-group">
              <label className="option-label">Ukuran Halaman:</label>
              <select
                className="select-input"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
              >
                <option value="a4">A4 (Standar Dokumen)</option>
                <option value="fit">Fit Image (Sesuaikan Ukuran Gambar)</option>
                <option value="letter">Letter</option>
              </select>
            </div>

            <div className="option-group">
              <label className="option-label">Orientasi Halaman:</label>
              <select
                className="select-input"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                disabled={pageSize === 'fit'}
              >
                <option value="portrait">Potret (Tegak)</option>
                <option value="landscape">Lanskap (Mendatar)</option>
              </select>
            </div>

            <div className="option-group">
              <label className="option-label">Margin/Jarak Tepi:</label>
              <select
                className="select-input"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
              >
                <option value="none">Tanpa Margin (Full Bleed)</option>
                <option value="small">Margin Kecil (20px)</option>
                <option value="large">Margin Besar (40px)</option>
              </select>
            </div>
          </div>

          {isProcessing && <ProgressBar progress={progress} label="Sedang Menggabungkan Gambar ke PDF..." />}

          {!resultBlob ? (
            <button
              className="btn-action"
              onClick={handleConvert}
              disabled={isProcessing}
            >
              <ImageIcon size={20} />
              <span>{isProcessing ? 'Membuat Dokumen PDF...' : `Konversi ${images.length} Gambar ke PDF`}</span>
            </button>
          ) : (
            <div className="result-card">
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <CheckCircle2 color="var(--accent-emerald)" size={28} />
                <span>Dokumen PDF Berhasil Dibuat!</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                PDF Anda sudah siap diunduh.
              </p>
              <button
                className="btn-action btn-success"
                onClick={handleDownload}
                style={{ marginTop: 0 }}
              >
                <Download size={20} />
                <span>Unduh File PDF</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
