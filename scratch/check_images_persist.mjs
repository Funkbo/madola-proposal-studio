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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(url, key);

async function main() {
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets?.map((b) => `${b.id} (public=${b.public})`).join(", "));

  const { data: rows, error } = await supabase
    .from("proposals")
    .select("id, reference, public_token, hero_image_url, layout_image_url")
    .limit(5);
  console.log("Proposals:", rows?.length, error?.message || "");
  rows?.forEach((r) => console.log(`  ${r.reference} | ${r.public_token} | hero=${r.hero_image_url ? "yes" : "no"} | layout=${r.layout_image_url ? "yes" : "no"}`));

  if (rows && rows.length > 0) {
    const token = rows[0].public_token;
    const { data: rpc } = await supabase.rpc("get_public_proposal", { p_token: token });
    console.log("RPC status:", rpc?.status, "| heroImage:", rpc?.proposal?.heroImage ? "yes" : "no", "| layoutImage:", rpc?.proposal?.layoutImage ? "yes" : "no");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});