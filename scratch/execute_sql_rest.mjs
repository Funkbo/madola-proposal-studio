import fs from "fs";

const url = "https://hqdeexzbzqptedurwxbq.supabase.co";
const key = "sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo";

const sql = fs.readFileSync("./supabase/migrations/20260811000000_day3b_block_proposal_schema.sql", "utf8");

async function run() {
  console.log("Testing REST SQL query...");
  try {
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({ sql_query: sql })
    });
    const status = res.status;
    const text = await res.text();
    console.log("Status:", status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
