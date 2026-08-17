const fs = require('fs');

async function inspectPdf() {
  const pdfPath = 'C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf';
  const dataBuffer = fs.readFileSync(pdfPath);

  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: dataBuffer });
  await parser.load();
  const textResult = await parser.getText();
  
  const pages = textResult.pages || [];
  console.log(`Total Pages: ${pages.length}`);
  
  pages.forEach((p, idx) => {
    console.log(`--- PAGE ${idx + 1} (${p.text.length} chars) ---`);
    console.log(p.text.substring(0, 500));
  });

  const fullRawText = pages.map(p => p.text).join("\n\n=== PAGE BREAK ===\n\n");
  fs.writeFileSync('scratch/full_pdf_text.txt', fullRawText);
  console.log("Full text saved to scratch/full_pdf_text.txt");
}

inspectPdf().catch(e => console.error("Error:", e.stack || e));
