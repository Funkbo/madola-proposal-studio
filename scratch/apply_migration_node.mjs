import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const url = "https://hqdeexzbzqptedurwxbq.supabase.co";
const key = "sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo";

const supabase = createClient(url, key);

const sql = fs.readFileSync("./supabase/migrations/20260811000000_day3b_block_proposal_schema.sql", "utf8");

console.log("Migration script ready. Length:", sql.length);

async function verifyTables() {
  const tables = [
    "companies",
    "company_branding",
    "properties",
    "proposal_template_versions",
    "proposal_blocks",
    "proposal_products",
    "payment_milestones",
    "proposal_acceptance",
    "media_assets",
    "customers",
    "proposals",
    "solar_systems",
    "financials",
    "monthly_energy",
    "products",
    "proposal_templates"
  ];

  console.log("\n--- POST-MIGRATION TABLE VERIFICATION ---");
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`Table '${t}': MISSING OR ERROR (${error.message})`);
    } else {
      console.log(`Table '${t}': EXISTS (${count ?? 0} rows)`);
    }
  }
}

verifyTables();
