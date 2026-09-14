import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Set up PDF.js worker URL dynamically
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.mjs`;

/**
 * Compress PDF client-side by re-encoding pages to optimized JPEG canvas images
 * @param {File} file - PDF file to compress
 * @param {Object} options - { level: 'extreme' | 'recommended' | 'low', onProgress: fn }
 */
export async function compressPdfFile(file, options = {}) {
  const { level = 'recommended', onProgress } = options;
  
  // Set scale and quality parameters based on level
  let scale = 1.0;
  let quality = 0.65;
  
  if (level === 'extreme') {
    scale = 0.75;
    quality = 0.45;
  } else if (level === 'recommended') {
    scale = 1.0;
    quality = 0.65;
  } else if (level === 'low') {
    // Low compression = high quality output
    scale = 1.25;
    quality = 0.85;
  }

  const arrayBuffer = await file.arrayBuffer();
  
  // Load document with PDF.js
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  // Create new PDF document with pdf-lib
  const newPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) {
      onProgress(Math.round((i / numPages) * 90));
    }

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: scale });

    // Render page to HTML5 Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background for transparent pages
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    // Convert canvas to JPEG Data URL
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());

    // Embed JPEG in new PDF
    const embeddedImg = await newPdfDoc.embedJpg(jpegBytes);
    
    // Maintain original page proportions
    const origViewport = page.getViewport({ scale: 1.0 });
    const newPage = newPdfDoc.addPage([origViewport.width, origViewport.height]);
    newPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });
  }

  if (onProgress) {
    onProgress(95);
  }

  const compressedPdfBytes = await newPdfDoc.save();
  const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });

  if (onProgress) {
    onProgress(100);
  }

  const originalSize = file.size;
  const compressedSize = compressedBlob.size;
  const savingsPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

  return {
    blob: compressedBlob,
    originalSize,
    compressedSize,
    savingsPercent,
    fileName: `compressed_${file.name}`
  };
}

/**
 * Format bytes to readable size string
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
