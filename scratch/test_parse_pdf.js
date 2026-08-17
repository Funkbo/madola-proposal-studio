const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = 'C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf';

async function parse() {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  console.log("=== RAW PDF TEXT (first 3000 chars) ===");
  console.log(data.text.substring(0, 3000));
  console.log("=== TOTAL PAGES ===", data.numpages);
  console.log("=== TOTAL TEXT LENGTH ===", data.text.length);

  fs.writeFileSync('scratch/pdf_text.txt', data.text);
  console.log("Saved full text to scratch/pdf_text.txt");
}

parse();
