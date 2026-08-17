const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function dumpSolarOptionsText(filePath) {
  console.log("==============================================");
  console.log("FILE:", filePath);
  if (!fs.existsSync(filePath)) {
    console.log("File not found");
    return;
  }
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  await parser.load();
  const textResult = await parser.getText();
  
  const idx = textResult.text.indexOf("Solar Options");
  if (idx !== -1) {
    console.log("FOUND 'Solar Options' at index", idx);
    console.log("--- TEXT (1500 chars around Solar Options) ---");
    console.log(textResult.text.substring(idx - 100, idx + 2000));
  } else {
    console.log("NOT FOUND 'Solar Options'");
  }
}

async function run() {
  await dumpSolarOptionsText('C:\\Users\\shubh\\Downloads\\1786212369547-OpenSolar_Proposal.pdf');
  await dumpSolarOptionsText('C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf');
}

run();
