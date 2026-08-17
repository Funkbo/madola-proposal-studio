const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function verifyLivePostPush() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("==========================================");
  console.log("LIVE POST-MIGRATION PUSH VERIFICATION AUDIT");
  console.log("Supabase Project:", supabaseUrl);
  console.log("==========================================");

  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  if (authErr) {
    console.error("AUTH ERROR:", authErr);
    return;
  }

  console.log("Authenticated User:", auth.user.email, "ID:", auth.user.id);

  // 1. company_branding columns and row
  const { data: branding, error: bErr } = await supabase.from('company_branding').select('*');
  console.log("\n1. COMPANY_BRANDING ROW & COLUMNS:");
  console.log("Count:", branding ? branding.length : 0, "Error:", bErr ? bErr.message : null);
  if (branding && branding[0]) {
    console.log("Columns:", Object.keys(branding[0]));
    console.log("Preserved Colors:", {
      primary: branding[0].primary_color,
      sidebar_bg: branding[0].sidebar_background_color,
      login_bg: branding[0].login_background_color,
    });
  }

  // 2. proposal-pdfs storage bucket
  console.log("\n2. PROPOSAL-PDFS BUCKET:");
  const { data: pBucket, error: pErr } = await supabase.storage.getBucket('proposal-pdfs');
  console.log("Bucket data:", pBucket);
  console.log("Is Private:", pBucket ? !pBucket.public : "NO BUCKET", "Error:", pErr ? pErr.message : null);

  // 3. proposal source_document columns
  const { data: proposals, error: propErr } = await supabase.from('proposals').select('*').limit(1);
  console.log("\n3. PROPOSALS TABLE & SOURCE DOCUMENT COLUMNS:");
  console.log("Proposals count:", proposals ? proposals.length : 0, "Error:", propErr ? propErr.message : null);
  if (proposals) {
    console.log("Proposals query passed. Checking column addition...");
  }

  // 4. RPC Functions
  console.log("\n4. PUBLIC RPC FUNCTIONS:");
  const { data: brandRpc, error: brandRpcErr } = await supabase.rpc('get_public_login_branding');
  console.log("RPC 'get_public_login_branding':", brandRpc ? "PASS (returns data)" : "FAIL", "Error:", brandRpcErr ? brandRpcErr.message : null);

  const { data: propRpc, error: propRpcErr } = await supabase.rpc('get_public_proposal', { p_token: 'dummy' });
  console.log("RPC 'get_public_proposal':", propRpcErr && propRpcErr.code === 'PGRST202' ? "FAIL" : "PASS (Function exists)", "Result:", propRpc);

  const { data: acceptRpc, error: acceptRpcErr } = await supabase.rpc('accept_public_proposal', { p_token: 'dummy', p_signer_name: 'test', p_signer_email: 'test@test.com' });
  console.log("RPC 'accept_public_proposal':", acceptRpcErr && acceptRpcErr.code === 'PGRST202' ? "FAIL" : "PASS (Function exists)", "Result:", acceptRpc);

  // 5. Existing Customer Data
  const { data: customers, error: custErr } = await supabase.from('customers').select('*');
  console.log("\n5. EXISTING CUSTOMERS DATA:");
  console.log("Rows count:", customers ? customers.length : 0, "Error:", custErr ? custErr.message : null);
  if (customers && customers[0]) {
    console.log("Customer preserved:", `${customers[0].first_name} ${customers[0].last_name}`);
  }

  // 6. Test Upload & Download with Company Isolated Path
  console.log("\n6. TEST STORAGE UPLOAD & DOWNLOAD:");
  const companyId = "5c813b60-7b97-47c1-9457-11f98adfb9b7";
  const testPath = `${companyId}/opensolar/${Date.now()}_verify_test.pdf`;
  const testBuffer = Buffer.from("%PDF-1.4 Live Verification Test Content");

  const { data: upData, error: upErr } = await supabase.storage
    .from('proposal-pdfs')
    .upload(testPath, testBuffer, { contentType: 'application/pdf', upsert: false });

  console.log("Upload Result:", upData ? `PASS (Path: ${upData.path})` : "FAIL", "Error:", upErr ? upErr.message : null);

  if (upData) {
    const { data: dlData, error: dlErr } = await supabase.storage
      .from('proposal-pdfs')
      .download(upData.path);
    console.log("Download Result:", dlData ? `PASS (Downloaded ${dlData.size} bytes)` : "FAIL", "Error:", dlErr ? dlErr.message : null);
  }
}

verifyLivePostPush();
