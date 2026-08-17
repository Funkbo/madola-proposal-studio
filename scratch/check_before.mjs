import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const url = "https://hqdeexzbzqptedurwxbq.supabase.co";
const key = "sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo";

const supabase = createClient(url, key);

async function checkBefore() {
  console.log("--- BEFORE MIGRATION CHECK ---");
  const tables = ["customers", "proposals", "solar_systems", "financials", "monthly_energy", "products", "profiles"];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`Table ${table}: Error (${error.message})`);
    } else {
      console.log(`Table ${table}: ${count} rows`);
    }
  }
}

checkBefore();
