const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testCompanyIsolatedStorage() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Supabase project URL:", supabaseUrl);

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  if (authErr) {
    console.error("AUTH ERROR:", authErr);
    return;
  }

  const { data: userRes } = await supabase.auth.getUser();
  console.log("Authenticated User:", userRes.user ? userRes.user.email : "NO USER", "ID:", userRes.user ? userRes.user.id : null);

  const companyId = "5c813b60-7b97-47c1-9457-11f98adfb9b7";
  const bucketName = "proposal-pdfs";
  const targetPath = `${companyId}/opensolar/${Date.now()}_OpenSolar_Proposal.pdf`;

  console.log(`\nAttempting upload to bucket '${bucketName}' at company-isolated path '${targetPath}'...`);

  const testBuffer = Buffer.from("%PDF-1.4 Company Isolated Storage Test Document");

  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(bucketName)
    .upload(targetPath, testBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  console.log("UPLOAD DATA:", uploadData);
  console.log("UPLOAD ERROR:", uploadErr);

  if (uploadErr) {
    console.log("Upload Status: FAIL");
    console.log("Upload Error:", uploadErr.message);
    return;
  }

  console.log("Upload Status: PASS");
  console.log("Returned path:", uploadData.path);

  // List object in folder
  console.log("\nVerifying object in storage list...");
  const { data: listData, error: listErr } = await supabase.storage
    .from(bucketName)
    .list(`${companyId}/opensolar`);

  console.log("LIST DATA:", listData);
  console.log("LIST ERROR:", listErr);

  const isVisible = listData?.some((item) => item.name === uploadData.path.split("/").pop());
  console.log("Object Visible in Supabase Storage:", isVisible ? "YES" : "NO");

  // Attempt download
  console.log("\nAttempting download of exact path returned by upload:", uploadData.path);
  const { data: downloadData, error: downloadErr } = await supabase.storage
    .from(bucketName)
    .download(uploadData.path);

  console.log("DOWNLOAD DATA:", downloadData ? `Size: ${downloadData.size} bytes` : null);
  console.log("DOWNLOAD ERROR:", downloadErr);

  console.log("Download Status:", downloadErr ? "FAIL" : "PASS");
}

testCompanyIsolatedStorage();
