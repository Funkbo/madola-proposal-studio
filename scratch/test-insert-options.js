const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testInsertOptions() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const compId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';

  // 1. Try insert with id
  const { data: res1, error: err1 } = await supabase
    .from('company_branding')
    .insert({
      id: '39fab6bb-97e9-4a57-80b5-04f4919f7099',
      company_id: compId,
      sidebar_background_color: '#123456'
    })
    .select();

  console.log("Insert with ID result:", res1, "Error:", err1);

  // 2. Try insert with only company_id
  const { data: res2, error: err2 } = await supabase
    .from('company_branding')
    .insert({
      company_id: compId
    })
    .select();

  console.log("Insert only company_id result:", res2, "Error:", err2);
}

testInsertOptions();
