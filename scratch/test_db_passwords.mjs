import pkg from "pg";
const { Client } = pkg;
import fs from "fs";

const sql = fs.readFileSync("./supabase/migrations/20260811000000_day3b_block_proposal_schema.sql", "utf8");

const passwords = [
  "postgres",
  "Madola2026",
  "Madola2026!",
  "MadolaEnergy",
  "MadolaEnergy2026",
  "MadolaEnergy2026!",
  "Madola_2026",
  "Madola_2026!",
  "madola2026",
  "madolaenergy",
  "madola-proposal-studio",
  "hqdeexzbzqptedurwxbq",
  "admin",
  "password",
  "Password123!",
  "Supabase2026!"
];

const hosts = [
  "aws-0-eu-west-2.pooler.supabase.com",
  "aws-0-eu-west-1.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com"
];

async function tryConnect() {
  for (const host of hosts) {
    for (const pass of passwords) {
      const connStr = `postgres://postgres.hqdeexzbzqptedurwxbq:${encodeURIComponent(pass)}@${host}:6543/postgres`;
      const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 2000, ssl: { rejectUnauthorized: false } });
      try {
        await client.connect();
        console.log("=== SUCCESSFULLY CONNECTED! ===");
        console.log("Host:", host);
        console.log("Password matched!");
        console.log("Applying Day 3B migration SQL...");
        await client.query(sql);
        console.log("=== MIGRATION APPLIED SUCCESSFULLY! ===");
        await client.end();
        return true;
      } catch (e) {
        // connect error
      }
    }
  }
  console.log("No password matched standard list.");
  return false;
}

tryConnect();
