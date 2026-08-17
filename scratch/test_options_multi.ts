import fs from "fs";
import { parseOpenSolarPdfBuffer } from "../src/lib/services/pdfExtractor";

async function testOptionsMulti() {
  const files = [
    "C:\\Users\\shubh\\Downloads\\Solar PV Proposal_Tushar Morzaria, 4a Davenham Avenue, Northwood HA6 3HN.pdf",
    "C:\\Users\\shubh\\Downloads\\GHL\\Madola Proposal Tool\\Evidence_Gathering\\Opensolar_Customer_Pdf\\OpenSolar_Proposal.pdf"
  ];

  for (const filePath of files) {
    console.log("===============================================");
    console.log("Testing PDF:", filePath);
    if (!fs.existsSync(filePath)) {
      console.log("File does not exist");
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const result = await parseOpenSolarPdfBuffer(buffer);
    
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
}

testOptionsMulti();
