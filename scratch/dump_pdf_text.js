const fs = require('fs');

async function testPdf() {
  const pdfPath = 'C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf';
  const dataBuffer = fs.readFileSync(pdfPath);

  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: dataBuffer });
  await parser.load();
  const textResult = await parser.getText();
  console.log("Text result length:", textResult.text ? textResult.text.length : textResult.length);
  console.log("Sample text:\n", typeof textResult === 'string' ? textResult.substring(0, 1000) : JSON.stringify(textResult).substring(0, 1000));

  fs.writeFileSync('scratch/pdf_text.txt', typeof textResult === 'string' ? textResult : (textResult.text || JSON.stringify(textResult)));
}

testPdf().catch(e => console.error("Error:", e.stack || e));
