const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function inspectPolicies() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const companyId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';

  // 1. Try UPDATE
  const { data: updRes, error: updErr } = await supabase
    .from('company_branding')
    .update({ sidebar_background_color: '#123456' })
    .eq('company_id', companyId)
    .select();

  console.log("UPDATE result:", updRes, "Error:", updErr);

  // 2. Try INSERT
  const { data: insRes, error: insErr } = await supabase
    .from('company_branding')
    .insert({
      company_id: companyId,
      sidebar_background_color: '#123456'
    })
    .select();

  console.log("INSERT result:", insRes, "Error:", insErr);
}

inspectPolicies();
