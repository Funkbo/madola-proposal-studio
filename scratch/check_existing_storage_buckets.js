const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function checkStorage() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const { data: bList, error: bErr } = await supabase.storage.listBuckets();
  console.log("listBuckets:", bList, bErr);

  const { data: bGet, error: gErr } = await supabase.storage.getBucket('proposal-pdfs');
  console.log("getBucket proposal-pdfs:", bGet, gErr);

  const { data: bLogos, error: lErr } = await supabase.storage.getBucket('company-logos');
  console.log("getBucket company-logos:", bLogos, lErr);
}

checkStorage();
