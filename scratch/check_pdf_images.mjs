import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function listAll(prefix) {
  const { data: files, error } = await supabase.storage.from("proposal-pdfs").list(prefix, { limit: 200 });
  if (error) return [];
  const out = [];
  for (const f of files || []) {
    if (f.metadata?.size > 0) out.push(`${prefix ? prefix + "/" : ""}${f.name}`);
  }
  return out;
}

async function main() {
  let pdfs = [];
  const roots = await listAll("");
  for (const r of roots) {
    pdfs.push(r);
    const sub = await listAll(r);
    pdfs = pdfs.concat(sub);
  }
  console.log("PDFs in storage:", pdfs.length);
  pdfs.forEach((p) => console.log(`  - ${p}`));

  const outDir = "C:/Users/shubh/AppData/Local/Temp/opencode/pdfcheck";
  fs.mkdirSync(outDir, { recursive: true });

  for (const p of pdfs) {
    const { data, error: dlErr } = await supabase.storage.from("proposal-pdfs").download(p);
    if (dlErr || !data) {
      console.log(`\n${p}: DOWNLOAD FAILED ${dlErr?.message}`);
      continue;
    }
    const buf = Buffer.from(await data.arrayBuffer());
    const safeName = p.replace(/[\/\\]/g, "_");
    const localPath = path.join(outDir, safeName);
    fs.writeFileSync(localPath, buf);

    const { extractImagesFromPdfBuffer } = await import("../src/lib/services/pdfExtractor");
    const imgs = extractImagesFromPdfBuffer(buf);
    console.log(`\n${p}: ${buf.length / 1024} KB pdf, extracted ${imgs.length} images`);
    imgs.forEach((u, i) => {
      const mime = u.startsWith("data:image/png") ? "png" : "jpeg";
      console.log(`  [${i}] ${mime} ${Math.round((u.length * 3) / 4) / 1024} KB raw (${u.length} b64 chars)`);
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});