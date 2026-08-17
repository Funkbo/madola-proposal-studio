import { createClient } from "@supabase/supabase-js";

const url = "https://hqdeexzbzqptedurwxbq.supabase.co";
const key = "sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo";

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from("products").select("*");
  console.log("Products data:", data);
  console.log("Products error:", error);
}

test();
