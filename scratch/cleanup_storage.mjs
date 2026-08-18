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
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(url, key);

async function main() {
  const { data: signIn } = await supabase.auth.signInWithPassword({
    email: "demo@demo.com",
    password: "Nalin@12345",
  });
  if (!signIn?.session) {
    console.log("SIGN IN FAILED");
    return;
  }
  const prefix = "5c813b60-7b97-47c1-9457-11f98adfb9b7";
  for (const bucket of ["proposal-images", "proposal-pdfs"]) {
    const { data: files, error } = await supabase.storage.from(bucket).list(prefix, { limit: 100 });
    console.log(`${bucket} list:`, files?.length, error?.message || "");
    for (const f of files || []) {
      if (f.name.startsWith("test")) {
        const { error: delErr } = await supabase.storage.from(bucket).remove([`${prefix}/${f.name}`]);
        console.log(`  deleted ${f.name}:`, delErr?.message || "OK");
      }
    }
  }
}

main().catch((e) => {
  console.error("EXC:", e.message);
  process.exit(1);
});