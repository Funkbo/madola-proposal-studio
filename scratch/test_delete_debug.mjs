import { createClient } from "@supabase/supabase-js";

const url = "https://hqdeexzbzqptedurwxbq.supabase.co";
const key = "sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo";

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from("proposals").select("id, reference, status");
  console.log("Existing proposals in Supabase DB:", data, "Error:", error);

  if (data && data.length > 0) {
    const target = data[0];
    console.log("Attempting to delete proposal:", target);
    const delRes = await supabase.from("proposals").delete().eq("id", target.id).select();
    console.log("Delete result:", delRes);
  }
}

run();
