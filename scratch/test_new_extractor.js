const fs = require('fs');

async function testNewExtractor() {
  const fullText = fs.readFileSync('scratch/full_pdf_text.txt', 'utf8');
  
  // Test loading pdfExtractor
  const { extractFromText } = require('../src/lib/services/pdfExtractor.ts');
  const result = extractFromText(fullText);

  console.log("=== EXTRACTION RESULT ===");
  console.log("Customer Name:", result.customerName);
  console.log("Address:", result.address);
  console.log("System Size:", result.systemSizeKwp);
  console.log("Panels:", result.panelQuantity.value, "x", result.panelManufacturer.value, result.panelModel.value);
  console.log("Inverter:", result.inverterManufacturer.value, result.inverterModel.value, result.inverterCapacityKw.value, "kW");
  console.log("Battery:", result.batteryManufacturer.value, result.batteryModel.value, result.batteryCapacityKwh.value, "kWh");
  console.log("System Price:", result.systemPricePounds);
  console.log("First Year Savings:", result.firstYearSavingsPounds);
  console.log("Monthly rows count:", result.monthlyData.length);
  console.log("Extracted products count:", result.products.length);
  console.log("Status:", result.status);
}

// Node ts-node / typescript require runner
require('ts-node/register');
testNewExtractor().catch(e => console.error("Error:", e.stack || e));
