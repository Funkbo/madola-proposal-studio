const fs = require('fs');
const path = require('path');

function extractImagesFromPdfBuffer(pdfBuffer) {
  const images = [];
  try {
    const bytes = pdfBuffer;
    let i = 0;

    while (i < bytes.length - 3) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
        const start = i;
        i += 2;
        while (i < bytes.length - 1) {
          if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) {
            const end = i + 2;
            const imgBuffer = bytes.subarray(start, end);
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

const pdfPath = 'C:\\Users\\shubh\\Downloads\\Solar PV Proposal_Tushar Morzaria, 4a Davenham Avenue, Northwood HA6 3HN.pdf';
if (fs.existsSync(pdfPath)) {
  const buf = fs.readFileSync(pdfPath);
  const images = extractImagesFromPdfBuffer(buf);
  console.log(`Extracted ${images.length} images.`);
  images.forEach((img, i) => {
    console.log(`Image ${i + 1}: ${img.size} bytes`);
  });
  // Sort by size descending (the largest image in OpenSolar PDFs is always the aerial roof layout!)
  images.sort((a, b) => b.size - a.size);
  console.log("LARGEST EMBEDDED IMAGE SIZE:", images[0].size, "bytes");
} else {
  console.log("PDF not found at", pdfPath);
}
