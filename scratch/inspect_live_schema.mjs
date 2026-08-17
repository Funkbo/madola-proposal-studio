import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const k = parts[0].trim();
    const v = parts.slice(1).join("=").trim();
    if (k) env[k] = v;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'demo@demo.com',
    password: 'Demo12345'
  });

  const compId = '5c813b60-7b97-47c1-9457-11f98adfb9b7';

  // Insert base row
  const { data: inserted, error: insertErr } = await supabase
    .from('company_branding')
    .insert({
      company_id: compId,
      logo_path: 'Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp',
      logo_url: 'https://hqdeexzbzqptedurwxbq.supabase.co/storage/v1/object/public/company-branding/Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp',
      primary_color: '#10b981',
      secondary_color: '#0f172a'
    })
    .select();

  console.log("INSERT Result:", inserted, "Error:", insertErr);

  // Fetch row
  const { data: rows, error: selectErr } = await supabase
    .from('company_branding')
    .select('*')
    .eq('company_id', compId);

  console.log("SELECT Result:", rows, "Error:", selectErr);
  if (rows && rows.length > 0) {
    console.log("Actual LIVE Columns in company_branding:", Object.keys(rows[0]));
  }
}

inspectColumns();
