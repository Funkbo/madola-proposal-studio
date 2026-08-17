const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testBranding() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const compId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';

  // Test upsert
  const { data: upserted, error: upsertErr } = await supabase
    .from('company_branding')
    .upsert(
      {
        company_id: compId,
        logo_path: 'Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp',
        logo_url: '/storage/v1/object/public/company-branding/Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp',
        primary_color: '#10b981',
        secondary_color: '#0f172a'
      },
      { onConflict: 'company_id' }
    )
    .select();

  console.log("UPSERT result:", upserted, "upsertErr:", upsertErr);
}

testBranding();
