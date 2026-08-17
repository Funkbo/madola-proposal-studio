const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function checkAllBuckets() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const bucketsToTest = ['proposal-pdfs', 'proposals', 'company-logos', 'branding', 'documents', 'public', 'uploads', 'files', 'assets'];

  for (const b of bucketsToTest) {
    const { data, error } = await supabase.storage.getBucket(b);
    if (error) {
      console.log(`Bucket '${b}': ${error.message} (${error.code || error.statusCode})`);
    } else {
      console.log(`Bucket '${b}': EXISTS! Data:`, data);
    }
  }
}

checkAllBuckets();
