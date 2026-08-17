import pkg from "pg";
const { Client } = pkg;
import fs from "fs";

const sql = fs.readFileSync("./supabase/migrations/20260811000000_day3b_block_proposal_schema.sql", "utf8");

// Test potential database connection strings or passwords if available
const projectRef = "hqdeexzbzqptedurwxbq";

const hosts = [
  `aws-0-eu-west-2.pooler.supabase.com`,
  `aws-0-eu-west-1.pooler.supabase.com`,
  `aws-0-eu-central-1.pooler.supabase.com`,
  `aws-0-us-east-1.pooler.supabase.com`,
  `db.${projectRef}.supabase.co`
];

console.log("Migration SQL loaded, length:", sql.length);
