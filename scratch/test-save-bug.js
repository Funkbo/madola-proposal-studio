const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testSaveBug() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Login as demo admin
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  if (authErr) {
    console.error("Auth failed:", authErr);
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', auth.user.id)
    .single();

  const companyId = profile.company_id;
  console.log("Authenticated User Company ID:", companyId);

  // 2. Query company_branding row before update
  const { data: rowBefore } = await supabase
    .from('company_branding')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  console.log("Row BEFORE update:", rowBefore);

  // 3. Perform update with #123456
  const payload = {
    company_id: companyId,
    sidebar_background_color: '#123456',
    updated_at: new Date().toISOString()
  };

  const { data: updateRes, error: updateErr } = await supabase
    .from('company_branding')
    .upsert(payload, { onConflict: 'company_id' })
    .select();

  console.log("UPSERT Result:", updateRes, "UPSERT Error:", updateErr);

  // 4. Query company_branding row after update
  const { data: rowAfter } = await supabase
    .from('company_branding')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  console.log("Row AFTER update:", rowAfter);
}

testSaveBug();
