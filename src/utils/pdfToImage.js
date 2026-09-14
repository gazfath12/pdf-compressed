import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.mjs`;

/**
 * Render all pages of a PDF file to images
 * @param {File} file - PDF file
 * @param {Object} options - { format: 'png' | 'jpg', scale: 1 | 2 | 3, quality: number, onProgress: fn }
 */
export async function convertPdfToImages(file, options = {}) {
  const {
    format = 'png',
    scale = 2, // 2x scale for sharp High-DPI output
    quality = 0.9,
    onProgress
  } = options;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const pageImages = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background for transparent pages
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, quality);

    pageImages.push({
      pageNumber: i,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}_page_${i}.${format}`
    });
  }

  return {
    numPages,
    pages: pageImages
  };
}

/**
 * Bundle rendered page images into a single ZIP file download
 * @param {Array} pages - Array of page image objects { fileName, dataUrl }
 * @param {string} zipName - Output zip filename
 */
export async function exportPagesAsZip(pages, zipName = 'pdf_images.zip') {
  const zip = new JSZip();

  for (const page of pages) {
    const base64Data = page.dataUrl.split(',')[1];
    zip.file(page.fileName, base64Data, { base64: true });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}
