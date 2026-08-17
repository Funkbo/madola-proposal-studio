const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function testUpdateFirst() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const companyId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';

  const payload = {
    company_id: companyId,
    sidebar_background_color: '#123456',
    sidebar_text_color: '#ffffff',
    login_background_color: '#f5f7f6',
    login_card_color: '#ffffff',
    button_color: '#10b981',
    button_text_color: '#ffffff',
    updated_at: new Date().toISOString()
  };

  // 1. Attempt UPDATE first
  const { data: updated, error: updateErr } = await supabase
    .from('company_branding')
    .update(payload)
    .eq('company_id', companyId)
    .select()
    .maybeSingle();

  console.log("UPDATE attempt:", updated, "Error:", updateErr);

  if (!updated && !updateErr) {
    console.log("No existing row to UPDATE. Attempting INSERT...");
    const { data: inserted, error: insertErr } = await supabase
      .from('company_branding')
      .insert(payload)
      .select()
      .maybeSingle();

    console.log("INSERT attempt:", inserted, "Error:", insertErr);
  }
}

testUpdateFirst();
