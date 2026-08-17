const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testRlsFunc() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  console.log("Auth UID:", auth.user.id);

  // Check profiles table for this user
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id);

  console.log("Profiles query result:", profile, "Error:", profErr);
}

testRlsFunc();
