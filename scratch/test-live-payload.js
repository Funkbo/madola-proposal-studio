const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testLivePayload() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Authenticate demo admin
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  if (authErr) {
    console.error("Auth failed:", authErr);
    return;
  }

  const companyId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';
  console.log("Authenticated User Company ID:", companyId);

  // 2. Build full mapped theme payload
  const payload = {
    company_id: companyId,
    primary_color: '#10b981',
    secondary_color: '#0f172a',
    sidebar_background_color: '#123456',
    sidebar_text_color: '#ffffff',
    login_background_color: '#f5f7f6',
    login_card_color: '#ffffff',
    button_color: '#10b981',
    button_text_color: '#ffffff',
    updated_at: new Date().toISOString()
  };

  console.log("Sending mapped payload:", payload);

  // 3. Perform upsert against live Supabase
  const { data: updateRes, error: updateErr } = await supabase
    .from('company_branding')
    .upsert(payload, { onConflict: 'company_id' })
    .select();

  console.log("Supabase UPSERT Result:", updateRes, "Error:", updateErr);

  // 4. Query live Supabase directly to verify stored row
  const { data: rowAfter, error: readErr } = await supabase
    .from('company_branding')
    .select(`
      company_id,
      primary_color,
      secondary_color,
      sidebar_background_color,
      sidebar_text_color,
      login_background_color,
      login_card_color,
      button_color,
      button_text_color,
      updated_at
    `)
    .eq('company_id', companyId)
    .maybeSingle();

  console.log("\n==========================================");
  console.log("LIVE SUPABASE QUERY RESULT AFTER SAVE:");
  console.log("==========================================");
  console.log(JSON.stringify(rowAfter, null, 2));
}

testLivePayload();
