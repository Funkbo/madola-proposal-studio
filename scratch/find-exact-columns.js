const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function findExactColumns() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const compId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';

  // Test upsert with only primary_color and secondary_color
  const { data: res1, error: err1 } = await supabase
    .from('company_branding')
    .upsert({
      company_id: compId,
      primary_color: '#123456',
      secondary_color: '#0f172a'
    }, { onConflict: 'company_id' })
    .select();

  console.log("UPSERT primary_color result:", res1, "Error:", err1);

  // Read back row
  const { data: readBack } = await supabase
    .from('company_branding')
    .select('*')
    .eq('company_id', compId);

  console.log("Readback row:", readBack);
}

findExactColumns();
