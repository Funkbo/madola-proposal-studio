const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function verifyLiveDb() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Auth check
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  if (authErr) {
    console.error("Auth error:", authErr.message);
    return;
  }
  console.log("Authenticated user:", auth.user.email);

  // 2. Fetch profile & company
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, company_id')
    .eq('id', auth.user.id)
    .single();

  console.log("User Profile:", profile);

  // 3. Inspect company_branding table in Live Supabase
  const { data: brandingRow, error: brandingErr } = await supabase
    .from('company_branding')
    .select('*')
    .eq('company_id', profile.company_id)
    .maybeSingle();

  console.log("Live company_branding row:", brandingRow, "Error:", brandingErr);

  // 4. Test upsert with theme columns
  const { data: upsertData, error: upsertErr } = await supabase
    .from('company_branding')
    .upsert({
      company_id: profile.company_id,
      company_name: 'Madola Energy',
      logo_path: 'Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp',
      logo_url: 'https://hqdeexzbzqptedurwxbq.supabase.co/storage/v1/object/public/company-branding/Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp',
      primary_color: '#10b981',
      secondary_color: '#0f172a',
      sidebar_background_color: '#0b1428',
      sidebar_text_color: '#ffffff',
      login_background_color: '#f5f7f6',
      login_card_color: '#ffffff',
      button_color: '#10b981',
      button_text_color: '#ffffff'
    }, { onConflict: 'company_id' })
    .select();

  console.log("Live UPSERT result:", upsertData, "UPSERT Error:", upsertErr);

  // 5. Inspect company-branding storage bucket in Live Supabase
  const { data: bucketFiles, error: bucketErr } = await supabase.storage
    .from('company-branding')
    .list('', { limit: 10 });

  console.log("Live company-branding storage bucket files:", bucketFiles, "Error:", bucketErr);
}

verifyLiveDb();
