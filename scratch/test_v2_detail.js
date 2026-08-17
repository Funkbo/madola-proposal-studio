const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function testV2Detail() {
  const filePath = "C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf";
  const buffer = fs.readFileSync(filePath);
  
  const parser = new PDFParse({ data: buffer });
  await parser.load();
  const textResult = await parser.getText();
  console.log("textResult.text type:", typeof textResult.text);
  console.log("textResult.text length:", textResult.text ? textResult.text.length : 0);
  console.log("textResult.pages length:", textResult.pages ? textResult.pages.length : 0);
  if (textResult.pages && textResult.pages[0]) {
    console.log("Page 0 keys:", Object.keys(textResult.pages[0]));
    console.log("Page 0 text type:", typeof textResult.pages[0].text);
  }
}

testV2Detail();
