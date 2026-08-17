import { createClient } from "@supabase/supabase-js";

const url = "https://hqdeexzbzqptedurwxbq.supabase.co";
const key = "sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo";

const supabase = createClient(url, key);

async function check() {
  const { data, error, count } = await supabase.from("proposals").select("*", { count: "exact" });
  console.log("Supabase proposals table:", { count, data, error });
}

check();
