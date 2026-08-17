const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function inspectLiveSchema() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("==========================================");
  console.log("LIVE DATABASE RECONCILIATION AUDIT");
  console.log("Target Supabase URL:", supabaseUrl);
  console.log("==========================================");

  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  if (authErr) {
    console.error("Auth sign in error:", authErr);
    return;
  }
  console.log("Logged in user:", auth.user.email, "ID:", auth.user.id);

  // 1. Check Profiles & Company ID
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*');
  console.log("\n1. PUBLIC.PROFILES:");
  console.log("Rows count:", profiles ? profiles.length : 0, "Error:", profErr ? profErr.message : null);
  if (profiles && profiles[0]) {
    console.log("Sample profile row:", profiles[0]);
  }

  // 2. Check Companies
  const { data: companies, error: compErr } = await supabase.from('companies').select('*');
  console.log("\n2. PUBLIC.COMPANIES:");
  console.log("Rows count:", companies ? companies.length : 0, "Error:", compErr ? compErr.message : null);
  if (companies && companies[0]) {
    console.log("Sample company row:", companies[0]);
  }

  // 3. Check Company Branding
  const { data: branding, error: brandErr } = await supabase.from('company_branding').select('*');
  console.log("\n3. PUBLIC.COMPANY_BRANDING:");
  console.log("Rows count:", branding ? branding.length : 0, "Error:", brandErr ? brandErr.message : null);
  if (branding && branding[0]) {
    console.log("Branding columns:", Object.keys(branding[0]));
    console.log("Branding colors:", {
      primary: branding[0].primary_color,
      secondary: branding[0].secondary_color,
      sidebar_bg: branding[0].sidebar_background_color,
      sidebar_text: branding[0].sidebar_text_color,
      login_bg: branding[0].login_background_color,
      login_card: branding[0].login_card_color,
      button_col: branding[0].button_color,
      button_text: branding[0].button_text_color,
    });
  }

  // 4. Check Customers
  const { data: customers, error: custErr } = await supabase.from('customers').select('*').limit(3);
  console.log("\n4. PUBLIC.CUSTOMERS:");
  console.log("Rows count:", customers ? customers.length : 0, "Error:", custErr ? custErr.message : null);
  if (customers && customers[0]) {
    console.log("Customer columns:", Object.keys(customers[0]));
    console.log("First customer:", `${customers[0].first_name} ${customers[0].last_name} (${customers[0].email})`);
  }

  // 5. Check Proposals
  const { data: proposals, error: propErr } = await supabase.from('proposals').select('*').limit(3);
  console.log("\n5. PUBLIC.PROPOSALS:");
  console.log("Rows count:", proposals ? proposals.length : 0, "Error:", propErr ? propErr.message : null);
  if (proposals && proposals[0]) {
    console.log("Proposals columns:", Object.keys(proposals[0]));
  }

  // 6. Check Solar Systems
  const { data: solar, error: solarErr } = await supabase.from('solar_systems').select('*').limit(1);
  console.log("\n6. PUBLIC.SOLAR_SYSTEMS:");
  console.log("Exists:", !solarErr, "Error:", solarErr ? solarErr.message : null);

  // 7. Check Financials
  const { data: fin, error: finErr } = await supabase.from('financials').select('*').limit(1);
  console.log("\n7. PUBLIC.FINANCIALS:");
  console.log("Exists:", !finErr, "Error:", finErr ? finErr.message : null);

  // 8. Check Candidate New Tables
  const candidateTables = [
    'proposal_blocks',
    'proposal_products',
    'payment_milestones',
    'proposal_acceptance',
    'properties',
    'proposal_templates',
    'proposal_template_versions'
  ];

  console.log("\n8. DAY 3B / BLOCK PROPOSAL CANDIDATE TABLES:");
  for (const t of candidateTables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table '${t}': MISSING (${error.code} - ${error.message})`);
    } else {
      console.log(`Table '${t}': EXISTS (sample row count: ${data.length})`);
    }
  }

  // 9. Check RPC Functions
  console.log("\n9. RPC FUNCTIONS AUDIT:");
  const { data: pubBrandData, error: pubBrandErr } = await supabase.rpc('get_public_login_branding');
  console.log("RPC 'get_public_login_branding':", pubBrandData ? "EXISTS (returns data)" : "MISSING", "Error:", pubBrandErr ? pubBrandErr.message : null);

  const { data: pubPropData, error: pubPropErr } = await supabase.rpc('get_public_proposal', { p_token: 'dummy' });
  console.log("RPC 'get_public_proposal':", pubPropErr && pubPropErr.code === 'PGRST202' ? "MISSING" : "EXISTS", "Error:", pubPropErr ? pubPropErr.message : null);

  const { data: acceptData, error: acceptErr } = await supabase.rpc('accept_public_proposal', { p_token: 'dummy', p_signer_name: 'test', p_signer_email: 'test@test.com' });
  console.log("RPC 'accept_public_proposal':", acceptErr && acceptErr.code === 'PGRST202' ? "MISSING" : "EXISTS", "Error:", acceptErr ? acceptErr.message : null);

  // 10. Check Storage Buckets
  console.log("\n10. STORAGE BUCKETS AUDIT:");
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log("Storage buckets list:", buckets, "Error:", bErr ? bErr.message : null);

  const { data: pBucket, error: pErr } = await supabase.storage.getBucket('proposal-pdfs');
  console.log("Bucket 'proposal-pdfs':", pBucket ? "EXISTS" : "MISSING", "Error:", pErr ? pErr.message : null);
}

inspectLiveSchema();
