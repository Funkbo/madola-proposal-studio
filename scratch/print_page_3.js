const fs = require('fs');

const text = fs.readFileSync('scratch/full_pdf_text.txt', 'utf8');
const pages = text.split('=== PAGE BREAK ===');

console.log("==================== PAGE 3 ====================");
console.log(pages[2]);
