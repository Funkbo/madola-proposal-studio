const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function searchAllDownloads() {
  const dir = 'C:\\Users\\shubh\\Downloads';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const stats = fs.statSync(fullPath);
      if (stats.size > 20000000) continue; // skip huge >20MB files
      const buffer = fs.readFileSync(fullPath);
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const textResult = await parser.getText();
      if (/Solar Options|Dura16|Powerwall 3/i.test(textResult.text)) {
        console.log("MATCH FOUND IN FILE:", file);
        const idx = textResult.text.search(/Solar Options|Dura16|Powerwall 3/i);
        console.log("Snippet:", textResult.text.substring(idx - 50, idx + 800));
        console.log("----------------------------------------------");
      }
    } catch (e) {
      // skip bad pdfs
    }
  }
}

searchAllDownloads();
