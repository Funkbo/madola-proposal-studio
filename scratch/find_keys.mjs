import fs from "fs";
import path from "path";

const root = "C:\\Users\\shubh\\.gemini";

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (!f.startsWith(".") && f !== "node_modules") searchDir(full);
      } else if (f.includes("env") || f.includes("supabase") || f.includes("config")) {
        console.log("Found candidate file:", full);
      }
    }
  } catch (e) {}
}

searchDir(root);
