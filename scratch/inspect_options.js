const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function inspectOptions(filePath) {
  console.log("=== Inspecting PDF:", filePath);
  if (!fs.existsSync(filePath)) {
    console.log("File does not exist:", filePath);
    return;
  }
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  await parser.load();
  const textResult = await parser.getText();
  
  const matches = textResult.text.match(/(?:System Option|Option\s+[0-9]|Recommended System|System Size|Tesla|Duracell|Hanchu|Sigen|Fox|SolaX|GivEnergy)[^\n]*/gi);
  console.log("Matched headlines/options:", matches ? matches.slice(0, 30) : "None");
}

async function run() {
  await inspectOptions('C:\\Users\\shubh\\Downloads\\1786212369547-OpenSolar_Proposal.pdf');
  await inspectOptions('C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf');
}

run();
