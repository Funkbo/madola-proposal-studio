import fs from "fs";
import path from "path";

const dirsToSearch = [
  "C:\\Users\\shubh\\Documents\\madola-proposal-studio",
  "C:\\Users\\shubh\\.gemini"
];

function searchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes("sb_secret") || content.includes("SUPABASE_SERVICE_ROLE_KEY") || content.includes("service_role")) {
      console.log("MATCH FOUND IN FILE:", filePath);
      const lines = content.split("\n");
      for (const line of lines) {
        if (line.includes("sb_secret") || line.includes("SUPABASE_SERVICE") || line.includes("service_role")) {
          console.log("  LINE:", line.trim());
        }
      }
    }
  } catch (e) {}
}

function searchDir(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else {
        searchFile(fullPath);
      }
    }
  } catch (e) {}
}

for (const d of dirsToSearch) {
  searchDir(d);
}

console.log("Search finished.");
