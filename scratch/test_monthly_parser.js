const fs = require('fs');

const fullText = fs.readFileSync('scratch/full_pdf_text.txt', 'utf8');

function parseMonthlyTable(text) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const rows = [];

  for (const m of months) {
    // Regex matching Month line e.g. Jan 171 346 183 9 1 90 54 37
    const reg = new RegExp(`${m}\\s+([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s+([-0-9]+)\\s+([0-9]+)`, 'i');
    const match = text.match(reg);
    if (match) {
      rows.push({
        month: m,
        generationKwh: parseInt(match[1], 10),
        consumptionKwh: parseInt(match[2], 10),
        importKwh: parseInt(match[3], 10),
        exportKwh: parseInt(match[4], 10),
        exportCreditPounds: parseInt(match[5], 10),
        billBeforePounds: parseInt(match[6], 10),
        billAfterPounds: parseInt(match[7], 10),
        savingsPounds: parseInt(match[8], 10)
      });
    }
  }

  return rows;
}

const monthly = parseMonthlyTable(fullText);
console.log("Parsed Monthly Rows:", monthly.length);
console.log(monthly);
