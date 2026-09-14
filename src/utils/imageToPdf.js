import { PDFDocument, PageSizes } from 'pdf-lib';

/**
 * Convert an array of image files into a single PDF
 * @param {Array<File>} imageFiles - Array of image files
 * @param {Object} options - { pageSize: 'a4' | 'fit' | 'letter', margin: 'none' | 'small' | 'large', orientation: 'portrait' | 'landscape', onProgress: fn }
 */
export async function convertImagesToPdf(imageFiles, options = {}) {
  const {
    pageSize = 'a4',
    margin = 'small',
    orientation = 'portrait',
    onProgress
  } = options;

  let marginSize = 0;
  if (margin === 'small') marginSize = 20;
  if (margin === 'large') marginSize = 40;

  const pdfDoc = await PDFDocument.create();
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }

    const file = imageFiles[i];
    const arrayBuffer = await file.arrayBuffer();
    
    // Embed image depending on type
    let embeddedImg;
    const type = file.type.toLowerCase();
    
    if (type.includes('png')) {
      embeddedImg = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // Default to JPG for jpeg, webp or canvas conversion fallback
      try {
        embeddedImg = await pdfDoc.embedJpg(arrayBuffer);
      } catch (err) {
        // If file format is not directly supported by pdf-lib (e.g. webp), convert via HTML Canvas to JPG
        const imgUrl = URL.createObjectURL(file);
        const img = await loadImage(imgUrl);
        URL.revokeObjectURL(imgUrl);
        
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
        const jpgBytes = await fetch(jpgUrl).then(res => res.arrayBuffer());
        embeddedImg = await pdfDoc.embedJpg(jpgBytes);
      }
    }

    const imgWidth = embeddedImg.width;
    const imgHeight = embeddedImg.height;

    let pageWidth, pageHeight;

    if (pageSize === 'fit') {
      pageWidth = imgWidth + (marginSize * 2);
      pageHeight = imgHeight + (marginSize * 2);
    } else {
      // Standard page dimensions (A4 or Letter)
      let baseDimensions = PageSizes.A4;
      if (pageSize === 'letter') {
        baseDimensions = PageSizes.Letter;
      }

      if (orientation === 'landscape') {
        pageWidth = baseDimensions[1];
        pageHeight = baseDimensions[0];
      } else {
        pageWidth = baseDimensions[0];
        pageHeight = baseDimensions[1];
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate image dimensions while preserving aspect ratio inside margins
    const availableWidth = pageWidth - (marginSize * 2);
    const availableHeight = pageHeight - (marginSize * 2);

    let drawWidth = imgWidth;
    let drawHeight = imgHeight;

    if (pageSize !== 'fit') {
      const scaleFactor = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      drawWidth = imgWidth * scaleFactor;
      drawHeight = imgHeight * scaleFactor;
    }

    // Center image on page
    const x = marginSize + (availableWidth - drawWidth) / 2;
    const y = marginSize + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImg, {
      x,
      y,
      width: drawWidth,
      height: drawHeight
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    fileName: `images_converted_${Date.now()}.pdf`
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
