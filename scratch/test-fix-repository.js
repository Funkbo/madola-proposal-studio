const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testFixRepository() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Auth
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const compId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';

  // 2. Build payload with ONLY existing live columns
  const payload = {
    company_id: compId,
    primary_color: '#123456',
    secondary_color: '#0f172a'
  };

  console.log("Sending payload:", payload);

  const { data: res, error: err } = await supabase
    .from('company_branding')
    .upsert(payload, { onConflict: 'company_id' })
    .select();

  console.log("Upsert result:", res, "Error:", err);
}

testFixRepository();
