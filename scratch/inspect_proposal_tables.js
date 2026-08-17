const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function inspectProposalTables() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  console.log("Auth user ID:", auth.user.id);

  // Test selecting 1 row from each table to inspect column keys
  const [propRes, solarRes, finRes, prodRes, payRes] = await Promise.all([
    supabase.from('proposals').select('*').limit(1),
    supabase.from('solar_systems').select('*').limit(1),
    supabase.from('financials').select('*').limit(1),
    supabase.from('proposal_products').select('*').limit(1),
    supabase.from('payment_milestones').select('*').limit(1)
  ]);

  console.log("proposals columns:", propRes.data ? Object.keys(propRes.data[0] || {}) : propRes.error);
  console.log("solar_systems columns:", solarRes.data ? Object.keys(solarRes.data[0] || {}) : solarRes.error);
  console.log("financials columns:", finRes.data ? Object.keys(finRes.data[0] || {}) : finRes.error);
  console.log("proposal_products columns:", prodRes.data ? Object.keys(prodRes.data[0] || {}) : prodRes.error);
  console.log("payment_milestones columns:", payRes.data ? Object.keys(payRes.data[0] || {}) : payRes.error);
}

inspectProposalTables();
