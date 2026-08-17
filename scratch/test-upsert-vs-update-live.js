const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testLiveOperations() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Sign in as demo admin
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  if (authErr) {
    console.error("Auth failed:", authErr.message);
    return;
  }
  console.log("Logged in as:", auth.user.email, "UID:", auth.user.id);

  // 2. Get auth company ID
  const { data: companyId } = await supabase.rpc('get_auth_company_id');
  console.log("RPC get_auth_company_id():", companyId);

  // 3. Query existing company_branding row
  const { data: existingRow, error: selectErr } = await supabase
    .from('company_branding')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  console.log("SELECT existing row:", existingRow, "Select Error:", selectErr);

  // 4. Test UPDATE
  const { data: updateData, error: updateErr } = await supabase
    .from('company_branding')
    .update({
      sidebar_background_color: '#123456',
      updated_at: new Date().toISOString()
    })
    .eq('company_id', companyId)
    .select();

  console.log("UPDATE result:", updateData, "Update Error:", updateErr);

  // 5. Test INSERT
  const { data: insertData, error: insertErr } = await supabase
    .from('company_branding')
    .insert({
      company_id: companyId,
      sidebar_background_color: '#123456',
      primary_color: '#10b981',
      secondary_color: '#0f172a'
    })
    .select();

  console.log("INSERT result:", insertData, "Insert Error:", insertErr);

  // 6. Test UPSERT
  const { data: upsertData, error: upsertErr } = await supabase
    .from('company_branding')
    .upsert({
      company_id: companyId,
      sidebar_background_color: '#123456',
      primary_color: '#10b981',
      secondary_color: '#0f172a'
    }, { onConflict: 'company_id' })
    .select();

  console.log("UPSERT result:", upsertData, "Upsert Error:", upsertErr);
}

testLiveOperations();
