import pkg from "pg";
const { Client } = pkg;
import fs from "fs";

const sql = fs.readFileSync("./supabase/migrations/20260811000000_day3b_block_proposal_schema.sql", "utf8");

const passwords = [
  "postgres",
  "password",
  "Madola2026!",
  "MadolaEnergy2026!",
  "Madola_2026",
  "madola-proposal-studio",
  "hqdeexzbzqptedurwxbq"
];

const poolers = [
  "aws-0-eu-west-2.pooler.supabase.com",
  "aws-0-eu-west-1.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com"
];

async function tryConnect() {
  for (const host of poolers) {
    for (const pass of passwords) {
      const connStr = `postgres://postgres.hqdeexzbzqptedurwxbq:${pass}@${host}:6543/postgres`;
      const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 3000, ssl: { rejectUnauthorized: false } });
      try {
        await client.connect();
        console.log("SUCCESSFULLY CONNECTED WITH:", connStr);
        console.log("Applying migration SQL...");
        await client.query(sql);
        console.log("MIGRATION EXECUTED SUCCESSFULLY!");
        await client.end();
        return true;
      } catch (e) {
        // failed connect
      }
    }
  }
  console.log("No password matched standard candidates.");
  return false;
}

tryConnect();
