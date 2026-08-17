const fs = require('fs');

async function runTest() {
  const fullText = fs.readFileSync('scratch/full_pdf_text.txt', 'utf8');

  // Regex extractors
  function matchField(regex, transform, fieldName, unit) {
    const found = fullText.match(regex);
    if (found && found[1] !== undefined) {
      try {
        const val = transform(found[1].trim());
        return { value: val, unit, confidence: "high", source: "OpenSolar" };
      } catch (e) {}
    }
    return { value: "NOT FOUND IN SOURCE", unit, confidence: "low", source: "OpenSolar", notes: "NOT FOUND IN SOURCE" };
  }

  const customerName = matchField(/Proposal for ([A-Za-z\s'-]{2,40})/i, s => s, "Customer Name");
  const address = matchField(/For: [^\n]+\n([^\n]+)/i, s => s, "Address");
  const quoteNumber = matchField(/Quote #: ([0-9]+)/i, s => s, "Quote #");
  const validityDate = matchField(/Valid until: ([^\n]+)/i, s => s, "Valid until");
  const preparedBy = matchField(/Prepared by: ([^\n]+)/i, s => s, "Prepared By");
  const preparedPhone = matchField(/Prepared by: [^\n]+\n([0-9\s+]+)/i, s => s, "Phone");
  const preparedEmail = matchField(/Prepared by: [^\n]+\n[0-9\s+]+\n([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i, s => s, "Email");

  const systemSize = matchField(/([0-9.]+) kW\s+System Size/i, s => parseFloat(s), "System Size", "kW");
  const annualGen = matchField(/([0-9,]+) kWh per year/i, s => parseInt(s.replace(/,/g, ''), 10), "Annual Gen", "kWh");
  const systemPrice = matchField(/Total System Price\s+including VAT\s+£([0-9,.]+)/i, s => parseFloat(s.replace(/,/g, '')), "System Price", "£");
  const year1Savings = matchField(/Estimated Annual\s+Energy Bill Savings\s+£([0-9,.]+)/i, s => parseFloat(s.replace(/,/g, '')), "Year 1 Savings", "£");

  // Panel details
  const panelsMatch = fullText.match(/([0-9]+) x ([0-9]+) Watt Panels \(([^)]+)\)/i);
  const panelQty = panelsMatch ? parseInt(panelsMatch[1], 10) : "NOT FOUND IN SOURCE";
  const panelWatt = panelsMatch ? parseInt(panelsMatch[2], 10) : "NOT FOUND IN SOURCE";
  const panelModel = panelsMatch ? panelsMatch[3] : "NOT FOUND IN SOURCE";

  // Inverter details
  const invMatch = fullText.match(/([0-9.]+) kW of Inverter Power\s+(Hanchu ESS|[A-Za-z0-9\s]+)\s+1 x ([A-Za-z0-9.-]+)/i);
  const invKw = invMatch ? parseFloat(invMatch[1]) : "NOT FOUND IN SOURCE";
  const invMfr = invMatch ? invMatch[2].trim() : "NOT FOUND IN SOURCE";
  const invModel = invMatch ? invMatch[3].trim() : "NOT FOUND IN SOURCE";

  // Battery details
  const batMatch = fullText.match(/([0-9.]+) kWh of Usable Capacity\s+(Hanchu ESS|[A-Za-z0-9\s]+)\s+1 x ([A-Za-z0-9.-]+)/i);
  const batCap = batMatch ? parseFloat(batMatch[1]) : "NOT FOUND IN SOURCE";
  const batMfr = batMatch ? batMatch[2].trim() : "NOT FOUND IN SOURCE";
  const batModel = batMatch ? batMatch[3].trim() : "NOT FOUND IN SOURCE";

  // Performance metrics
  const pvSelfCons = matchField(/Expected solar PV self-consumption \(PV Only\)\s+([0-9,]+)\s+kWh/i, s => parseInt(s.replace(/,/g, ''), 10), "PV Self Cons", "kWh");
  const pvSelfSuff = matchField(/Grid electricity independence \/ Self-su ciency \(PV\s+Only\)\s+([0-9.]+)\s+%/i, s => parseFloat(s), "PV Self Suff", "%");
  const eessSelfCons = matchField(/Expected solar PV self-consumption \(with EESS\)\s+([0-9,]+)\s+kWh/i, s => parseInt(s.replace(/,/g, ''), 10), "EESS Self Cons", "kWh");
  const eessSelfSuff = matchField(/Grid electricity independence \/ Self-su ciency \(with\s+EESS\)\s+([0-9.]+)\s+%/i, s => parseFloat(s), "EESS Self Suff", "%");
  const batDischarge = matchField(/Total energy discharged per annum\s+([0-9,]+)\s+kWh/i, s => parseInt(s.replace(/,/g, ''), 10), "Bat Discharge", "kWh");

  // Financials
  const npv = matchField(/£([0-9,]+)\s+Net Present Value/i, s => parseFloat(s.replace(/,/g, '')), "NPV", "£");
  const roi = matchField(/([0-9.]+)%\s+Total Return on\s+Investment/i, s => parseFloat(s), "ROI", "%");
  const roiRate = matchField(/([0-9.]+)%\s+Rate of Return on\s+Investment/i, s => parseFloat(s), "ROI Rate", "%");
  const inflation = matchField(/considering a ([0-9.]+)% increase in energy cost/i, s => parseFloat(s), "Inflation", "%");

  console.log("=== EXTRACTED TEST RESULTS ===");
  console.log("Customer:", customerName);
  console.log("Address:", address);
  console.log("Quote #:", quoteNumber);
  console.log("Valid until:", validityDate);
  console.log("Prepared By:", preparedBy, preparedPhone.value, preparedEmail.value);
  console.log("System Size:", systemSize);
  console.log("Panels:", panelQty, "x", panelWatt, "W", panelModel);
  console.log("Inverter:", invMfr, invModel, invKw, "kW");
  console.log("Battery:", batMfr, batModel, batCap, "kWh Usable");
  console.log("Annual Gen:", annualGen);
  console.log("System Price:", systemPrice);
  console.log("Year 1 Savings:", year1Savings);
  console.log("PV Self Cons / Suff:", pvSelfCons.value, pvSelfSuff.value);
  console.log("EESS Self Cons / Suff:", eessSelfCons.value, eessSelfSuff.value);
  console.log("Bat Discharge:", batDischarge.value);
  console.log("NPV:", npv);
  console.log("ROI:", roi, roiRate);
  console.log("Inflation:", inflation);
}

runTest();
