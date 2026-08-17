const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function checkTables() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const candidates = [
    'proposals',
    'proposal_blocks',
    'solar_systems',
    'financials',
    'customers',
    'companies',
    'profiles',
    'company_branding',
    'proposal_templates',
    'proposal_acceptance'
  ];

  for (const t of candidates) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table ${t}: Error ${error.code} - ${error.message}`);
    } else {
      console.log(`Table ${t}: EXISTS. Sample row keys:`, data[0] ? Object.keys(data[0]) : "(empty table)");
    }
  }
}

checkTables();
