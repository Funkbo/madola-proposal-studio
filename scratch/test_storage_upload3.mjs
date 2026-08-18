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
  const token = signIn?.session?.access_token;
  console.log("TOKEN:", token ? token.slice(0, 30) + "..." : "NONE");

  const buf = Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c626001000000ffff03000006000557bfabd40000000049454e44ae426082", "hex");

  const res = await fetch(`${url}/storage/v1/object/proposal-images/5c813b60-7b97-47c1-9457-11f98adfb9b7/test_upload3.png`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: key,
      "Content-Type": "image/png",
      "x-upsert": "true",
    },
    body: new Uint8Array(buf),
  });
  const body = await res.text();
  console.log("STATUS:", res.status);
  console.log("BODY:", body.slice(0, 600));
}

main().catch((e) => {
  console.error("EXC:", e.message);
  process.exit(1);
});