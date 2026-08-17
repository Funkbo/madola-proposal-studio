const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqdeexzbzqptedurwxbq.supabase.co';
const supabaseKey = 'sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo';

async function checkColumnsDetail() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  // Try inserting dummy row then deleting or reading column error to inspect columns
  const pRes = await supabase.from('proposals').insert({ reference: 'TEST-COL-CHECK' }).select();
  console.log("proposals insert:", pRes);
  if (pRes.data && pRes.data[0]) {
    console.log("proposals keys:", Object.keys(pRes.data[0]));
    await supabase.from('proposals').delete().eq('id', pRes.data[0].id);
  }

  const sRes = await supabase.from('solar_systems').insert({ system_size_kwp: 5.76 }).select();
  console.log("solar_systems insert:", sRes);
  if (sRes.data && sRes.data[0]) {
    console.log("solar_systems keys:", Object.keys(sRes.data[0]));
    await supabase.from('solar_systems').delete().eq('id', sRes.data[0].id);
  }

  const fRes = await supabase.from('financials').insert({ system_price: 10950 }).select();
  console.log("financials insert:", fRes);
  if (fRes.data && fRes.data[0]) {
    console.log("financials keys:", Object.keys(fRes.data[0]));
    await supabase.from('financials').delete().eq('id', fRes.data[0].id);
  }
}

checkColumnsDetail();
