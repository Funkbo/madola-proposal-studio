const fs = require("fs");

async function testPdfParseLib() {
  try {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const filePath = "C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf";
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    console.log("SUCCESS! Parsed pages:", data.numpages, "Length:", data.text.length);
  } catch (err) {
    console.error("FAILED:", err);
  }
}

testPdfParseLib();
