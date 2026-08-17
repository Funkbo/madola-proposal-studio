import { createClient } from '@supabase/supabase-js';
import { parseOpenSolarPdfBuffer, extractRawPdfTextStrings } from '../src/lib/services/pdfExtractor.ts';

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealPdf() {
  console.log('Downloading real OpenSolar PDF...');
  const { data, error } = await supabase.storage
    .from('proposal-pdfs')
    .download('5c813b60-7b97-47c1-9457-11f98adfb9b7/opensolar/1786624302272_OpenSolar_Proposal.pdf');

  if (error || !data) {
    console.error('Download error:', error);
    return;
  }

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log('PDF downloaded, buffer size:', buffer.length, 'bytes');

  const rawText = extractRawPdfTextStrings(buffer);
  console.log('=== RAW TEXT EXTRACTED (first 1500 chars) ===\n', rawText.substring(0, 1500));
  console.log('RAW TEXT LENGTH:', rawText.length);

  const result = await parseOpenSolarPdfBuffer(buffer);
  console.log('=== EXTRACTION RESULT ===');
  console.log('Customer Name:', result.customerName);
  console.log('Address:', result.address);
  console.log('Postcode:', result.postcode);
  console.log('Proposal Reference:', result.proposalReference);
  console.log('System Size kWp:', result.systemSizeKwp);
  console.log('Annual Generation kWh:', result.annualGenerationKwh);
  console.log('Panel Model:', result.panelModel);
  console.log('Inverter Model:', result.inverterModel);
  console.log('Battery Model:', result.batteryModel);
  console.log('System Price:', result.systemPricePounds);
  console.log('First Year Savings:', result.firstYearSavingsPounds);
}

testRealPdf();
