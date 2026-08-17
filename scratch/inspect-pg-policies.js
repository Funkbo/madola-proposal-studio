const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function inspectPgPolicies() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const companyId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';

  // 1. Try to fetch RPCs or table definitions
  console.log("Checking RLS behavior...");

  // 2. Try an insert with minimal columns or inspect profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', auth.user.id)
    .single();

  console.log("Profile details:", profile);
}

inspectPgPolicies();
