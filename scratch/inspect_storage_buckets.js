const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function checkBuckets() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const { data: buckets, error } = await supabase.storage.listBuckets();
  console.log("Existing Storage Buckets:", buckets, "Error:", error);
}

checkBuckets();
