const fs = require('fs');
const path = require('path');

function extractImagesFromPdfBuffer(pdfBuffer) {
  const images = [];
  try {
    const bytes = pdfBuffer;
    let i = 0;

    while (i < bytes.length - 3) {
      // Find JPEG start marker: 0xFF, 0xD8, 0xFF
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
        const start = i;
        i += 2;
        // Find JPEG end marker: 0xFF, 0xD9
        while (i < bytes.length - 1) {
          if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) {
            const end = i + 2;
            const imgBuffer = bytes.subarray(start, end);
            // Only keep images larger than 10KB to ignore icons/logos and target roof/panel diagram images
            if (imgBuffer.length > 10000) {
              images.push({
                size: imgBuffer.length,
                dataUrl: `data:image/jpeg;base64,${imgBuffer.toString('base64')}`
              });
            }
            i = end;
            break;
          }
          i++;
        }
      } else {
        i++;
      }
    }
  } catch (err) {
    console.error("Image extraction error:", err);
  }
  return images;
}

const downloads = 'C:\\Users\\shubh\\Downloads';
try {
  const files = fs.readdirSync(downloads);
  const pdfs = files.filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log("PDF files found in Downloads:", pdfs);
  for (const pdfFile of pdfs) {
    const fullPath = path.join(downloads, pdfFile);
    const buf = fs.readFileSync(fullPath);
    const extracted = extractImagesFromPdfBuffer(buf);
    console.log(`PDF '${pdfFile}' (${buf.length} bytes): Found ${extracted.length} embedded images > 10KB`);
    extracted.forEach((img, idx) => {
      console.log(`  - Image ${idx + 1}: ${img.size} bytes (${img.dataUrl.slice(0, 50)}...)`);
    });
  }
} catch (e) {
  console.error("Error reading downloads:", e);
}
