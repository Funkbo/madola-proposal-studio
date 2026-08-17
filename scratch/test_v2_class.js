const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function testV2() {
  const filePath = "C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf";
  const buffer = fs.readFileSync(filePath);
  
  try {
    const parser = new PDFParse({ data: buffer });
    console.log("Parser created. Loading...");
    await parser.load();
    console.log("Loaded. Getting text...");
    const textResult = await parser.getText();
    console.log("Text Result type:", typeof textResult);
    if (typeof textResult === 'string') console.log("Text length:", textResult.length);
    else console.log("Text result keys:", Object.keys(textResult));
  } catch (err) {
    console.error("PDFParse v2 error:", err);
  }
}

testV2();
