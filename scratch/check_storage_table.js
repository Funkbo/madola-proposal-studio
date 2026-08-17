const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function checkStorageTable() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  console.log("Logged in user:", auth.user.id);

  // Check if buckets table is readable or insertable
  const { data: bData, error: bErr } = await supabase.from('buckets', { schema: 'storage' }).select('*');
  console.log("storage.buckets query:", bData, bErr);
}

checkStorageTable();
