const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function diagnoseRls() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  console.log("User ID:", auth.user.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .single();

  console.log("Profile:", profile);

  const { data: companyId } = await supabase.rpc('get_auth_company_id');
  console.log("get_auth_company_id():", companyId);

  // Test insert into company_branding with exact matching company_id
  const { data: testIns, error: testErr } = await supabase
    .from('company_branding')
    .insert({
      company_id: profile.company_id,
      company_name: 'Madola Energy',
      primary_color: '#10b981',
      secondary_color: '#0f172a',
      sidebar_background_color: '#123456',
      sidebar_text_color: '#ffffff',
      login_background_color: '#f5f7f6',
      login_card_color: '#ffffff',
      button_color: '#10b981',
      button_text_color: '#ffffff'
    })
    .select();

  console.log("INSERT with all columns result:", testIns, "Error:", testErr);
}

diagnoseRls();
