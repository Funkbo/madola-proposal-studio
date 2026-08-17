import fs from "fs";
import { parseOpenSolarPdfBuffer } from "../src/lib/services/pdfExtractor";

async function testRealPdf() {
  const filePath = "C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf";
  const buffer = fs.readFileSync(filePath);
  
  console.log("Buffer size:", buffer.length, "bytes");
  const result = await parseOpenSolarPdfBuffer(buffer);
  
  console.log("Extracted Customer Name:", result.customerName);
  console.log("Extracted System Price:", result.systemPricePounds);
  console.log("Extracted Raw Text Length:", result.rawText?.length);
}

testRealPdf();
