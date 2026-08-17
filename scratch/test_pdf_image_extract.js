const fs = require("fs");
const zlib = require("zlib");

function deepExtractImagesFromPdfBuffer(pdfBuffer) {
  const images = [];

  // 1. Direct JPEG scan (FF D8 FF)
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
          if (imgBuffer.length > 2000) {
            images.push({
              size: imgBuffer.length,
              dataUrl: `data:image/jpeg;base64,${imgBuffer.toString("base64")}`,
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

  // 2. Scan PDF streams for FlateDecode / Zlib compressed image payloads
  const pdfText = pdfBuffer.toString("latin1");
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;

  while ((match = streamRegex.exec(pdfText)) !== null) {
    const rawStreamStr = match[1];
    const streamBuffer = Buffer.from(rawStreamStr, "latin1");

    // Try inflating with zlib
    let decompressed = null;
    try {
      decompressed = zlib.inflateSync(streamBuffer);
    } catch (e1) {
      try {
        decompressed = zlib.inflateRawSync(streamBuffer);
      } catch (e2) {
        try {
          decompressed = zlib.unzipSync(streamBuffer);
        } catch (e3) {}
      }
    }

    if (decompressed && decompressed.length > 2000) {
      // Check if decompressed buffer contains JPEG or PNG
      let dIdx = 0;
      while (dIdx < decompressed.length - 3) {
        if (decompressed[dIdx] === 0xff && decompressed[dIdx + 1] === 0xd8 && decompressed[dIdx + 2] === 0xff) {
          const start = dIdx;
          dIdx += 2;
          while (dIdx < decompressed.length - 1) {
            if (decompressed[dIdx] === 0xff && decompressed[dIdx + 1] === 0xd9) {
              const end = dIdx + 2;
              const imgBuffer = decompressed.subarray(start, end);
              if (imgBuffer.length > 2000) {
                images.push({
                  size: imgBuffer.length,
                  dataUrl: `data:image/jpeg;base64,${imgBuffer.toString("base64")}`,
                });
              }
              dIdx = end;
              break;
            }
            dIdx++;
          }
        } else if (
          decompressed[dIdx] === 0x89 &&
          decompressed[dIdx + 1] === 0x50 &&
          decompressed[dIdx + 2] === 0x4e &&
          decompressed[dIdx + 3] === 0x47
        ) {
          const start = dIdx;
          dIdx += 4;
          while (dIdx < decompressed.length - 7) {
            if (
              decompressed[dIdx] === 0x49 &&
              decompressed[dIdx + 1] === 0x45 &&
              decompressed[dIdx + 2] === 0x4e &&
              decompressed[dIdx + 3] === 0x47
            ) {
              const end = dIdx + 8;
              const imgBuffer = decompressed.subarray(start, Math.min(end, decompressed.length));
              if (imgBuffer.length > 2000) {
                images.push({
                  size: imgBuffer.length,
                  dataUrl: `data:image/png;base64,${imgBuffer.toString("base64")}`,
                });
              }
              dIdx = end;
              break;
            }
            dIdx++;
          }
        } else {
          dIdx++;
        }
      }
    }
  }

  images.sort((a, b) => b.size - a.size);
  return images.map((img) => img.dataUrl);
}

console.log("Deep image extractor initialized cleanly");
