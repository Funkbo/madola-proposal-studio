const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testBucketUpload() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  console.log("Logged in user:", auth.user.id);

  // Try creating bucket proposal-pdfs if missing
  const { data: createData, error: createError } = await supabase.storage.createBucket('proposal-pdfs', {
    public: true,
    fileSizeLimit: 26214400, // 25MB
    allowedMimeTypes: ['application/pdf']
  });

  console.log("Create Bucket Result:", createData, "Error:", createError);

  // Test upload dummy file
  const testBuffer = Buffer.from("Hello OpenSolar PDF Storage");
  const testPath = `test-company/opensolar/${Date.now()}_test.pdf`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('proposal-pdfs')
    .upload(testPath, testBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  console.log("Upload Result:", uploadData, "Error:", uploadError);

  // Test downloading
  const { data: downloadData, error: downloadError } = await supabase.storage
    .from('proposal-pdfs')
    .download(testPath);

  console.log("Download Result:", downloadData ? `Received ${downloadData.size} bytes` : null, "Error:", downloadError);
}

testBucketUpload();
