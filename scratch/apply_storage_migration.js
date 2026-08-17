const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function applyStorageMigration() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  console.log("Logged in user:", auth.user.id);

  const sql = fs.readFileSync('supabase/migrations/20260813000000_proposal_pdfs_storage_bucket.sql', 'utf8');

  // Test RPC execution if available
  const { data: rpcData, error: rpcErr } = await supabase.rpc('exec_sql', { sql_query: sql });
  console.log("exec_sql RPC:", rpcData, rpcErr);
}

applyStorageMigration();
