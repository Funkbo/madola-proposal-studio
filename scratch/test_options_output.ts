import fs from "fs";
import { parseOpenSolarPdfBuffer } from "../src/lib/services/pdfExtractor";

async function testOptions() {
  const filePath = "C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf";
  const buffer = fs.readFileSync(filePath);
  
  const result = await parseOpenSolarPdfBuffer(buffer);
  
  console.log("=== EXTRACTION RESULT SYSTEM OPTIONS ===");
  console.log("Options count:", result.systemOptions ? result.systemOptions.length : 0);
  if (result.systemOptions) {
    result.systemOptions.forEach((opt, idx) => {
      console.log(`Option ${idx + 1}: ${opt.optionName}`);
      console.log(`  Price: £${opt.systemPricePounds.value}`);
      console.log(`  Inverter: ${opt.inverterManufacturer.value} ${opt.inverterModel.value}`);
      console.log(`  Battery: ${opt.batteryManufacturer.value} ${opt.batteryModel.value}`);
    });
  }
}

testOptions();
