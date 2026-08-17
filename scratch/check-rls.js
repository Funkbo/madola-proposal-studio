const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function checkRls() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const { data: compId, error: compErr } = await supabase.rpc('get_auth_company_id');
  console.log("RPC get_auth_company_id:", compId, "Error:", compErr);

  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_manager_or_admin');
  console.log("RPC is_manager_or_admin:", isAdmin, "Error:", adminErr);
}

checkRls();
