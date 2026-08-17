const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testMethods() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  console.log("Authenticated as demo@demo.com, user id:", auth.user ? auth.user.id : null);

  // Method 1: storage.createBucket
  const res1 = await supabase.storage.createBucket('proposal-pdfs', {
    public: true,
    fileSizeLimit: 26214400,
    allowedMimeTypes: ['application/pdf']
  });
  console.log("createBucket result:", res1);

  // Method 2: Insert into storage.buckets table via schema('storage')
  const res2 = await supabase.from('buckets', { schema: 'storage' }).insert({
    id: 'proposal-pdfs',
    name: 'proposal-pdfs',
    public: true,
    file_size_limit: 26214400,
    allowed_mime_types: ['application/pdf']
  });
  console.log("insert storage.buckets result:", res2);
}

testMethods();
