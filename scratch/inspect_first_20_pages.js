const fs = require('fs');

const text = fs.readFileSync('scratch/full_pdf_text.txt', 'utf8');
const pages = text.split('=== PAGE BREAK ===');

for (let i = 0; i < Math.min(20, pages.length); i++) {
  console.log(`\n==================== PAGE ${i + 1} ====================`);
  console.log(pages[i]);
}
