import React, { useRef, useState } from 'react';
import { UploadCloud, FilePlus } from 'lucide-react';

export default function DropZone({
  onFilesSelected,
  accept = "application/pdf",
  multiple = false,
  title = "Tarik & Lepas File di Sini",
  subtitle = "atau klik tombol di bawah untuk memilih file dari perangkat Anda"
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? files : files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(multiple ? files : files[0]);
    }
  };

  return (
    <div
      className={`dropzone ${isDragOver ? 'active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
      <div className="dropzone-icon">
        <UploadCloud size={32} />
      </div>
      <div className="dropzone-title">{title}</div>
      <div className="dropzone-subtitle">{subtitle}</div>
      <button
        type="button"
        className="btn-select-files"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      >
        <FilePlus size={18} />
        <span>Pilih File</span>
      </button>
    </div>
  );
}
