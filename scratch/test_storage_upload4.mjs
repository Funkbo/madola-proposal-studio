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

  const buf = Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c626001000000ffff03000006000557bfabd40000000049454e44ae426082", "hex");

  for (const [bucket, path] of [
    ["proposal-pdfs", "5c813b60-7b97-47c1-9457-11f98adfb9b7/test_x.pdf"],
    ["proposal-images", "5c813b60-7b97-47c1-9457-11f98adfb9b7/test_x.png"],
  ]) {
    const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: key,
        "Content-Type": bucket === "proposal-pdfs" ? "application/pdf" : "image/png",
        "x-upsert": "true",
      },
      body: new Uint8Array(buf),
    });
    const body = await res.text();
    console.log(`${bucket}: ${res.status} ${body.slice(0, 120)}`);
  }
}

main().catch((e) => {
  console.error("EXC:", e.message);
  process.exit(1);
});