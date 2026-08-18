import fs from "fs";
import { extractImagesFromPdfBuffer } from "../src/lib/services/pdfExtractor";

const buf = fs.readFileSync("C:/Users/shubh/Downloads/GHL/Madola Proposal Tool/Evidence_Gathering/Opensolar_Customer_Pdf/OpenSolar_Proposal.pdf");
console.log("PDF size:", (buf.length / 1024).toFixed(1), "KB");
const imgs = extractImagesFromPdfBuffer(buf);
console.log("Images found:", imgs.length);
imgs.forEach((u, i) => {
  const mime = u.startsWith("data:image/png") ? "png" : "jpeg";
  console.log(`[${i}] ${mime} ${Math.round((u.length * 3) / 4 / 1024)} KB decoded (${u.length} b64 chars)`);
});