import fs from "fs";
import { extractFromText } from "../src/lib/services/pdfExtractor";

const fullText = fs.readFileSync("scratch/full_pdf_text.txt", "utf8");
const result = extractFromText(fullText);

console.log("=== ACTUAL RESULT FROM pdfExtractor.ts ===");
console.log("Customer Name:", result.customerName);
console.log("Address:", result.address);
console.log("Postcode:", result.postcode);
console.log("Proposal Ref:", result.proposalReference);
console.log("System Size:", result.systemSizeKwp);
console.log("Panels:", result.panelQuantity.value, "x", result.panelWattage.value, result.panelModel.value);
console.log("Inverter:", result.inverterManufacturer.value, result.inverterModel.value, result.inverterCapacityKw.value);
console.log("Battery:", result.batteryManufacturer.value, result.batteryModel.value, result.batteryCapacityKwh.value);
console.log("Annual Generation:", result.annualGenerationKwh);
console.log("System Price:", result.systemPricePounds);
console.log("First Year Savings:", result.firstYearSavingsPounds);
console.log("NPV:", result.npvPounds);
console.log("ROI:", result.roiPercent, "Rate:", result.roiRatePercent);
console.log("Normalised Customer:", result.normalised?.customer);
