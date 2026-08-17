import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const url = "https://hqdeexzbzqptedurwxbq.supabase.co";
const key = "sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo";

const supabase = createClient(url, key);

async function testRpc() {
  const sql = fs.readFileSync("./supabase/migrations/20260811000000_day3b_block_proposal_schema.sql", "utf8");
  
  console.log("Testing RPC sql execution...");
  const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });
  console.log("RPC result data:", data);
  console.log("RPC result error:", error);
}

testRpc();
