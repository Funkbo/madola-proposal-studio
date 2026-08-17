import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local
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
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runE2eVerification() {
  console.log("=========================================");
  console.log("STARTING LIVE SUPABASE E2E VERIFICATION");
  console.log("=========================================\n");

  // 1. Check Companies Table & Schema
  console.log("--- TEST 2: SUPABASE IDENTITY & SCHEMA INSPECTION ---");
  const { data: companies, error: companyErr } = await supabase.from("companies").select("*");
  console.log("Companies count:", companies?.length, "Error:", companyErr?.message || "None");
  if (companies && companies.length > 0) {
    console.log("Madola Energy Company ID:", companies[0].id);
  }

  // Check Profiles Table
  const { data: profiles, error: profileErr } = await supabase.from("profiles").select("*");
  console.log("Profiles count:", profiles?.length, "Error:", profileErr?.message || "None");
  if (profiles && profiles.length > 0) {
    console.log("Sample Profile:", profiles[0]);
  }

  // 2. Check Customer Insert & Update
  console.log("\n--- TEST 3: CUSTOMER INSERT & UPDATE TEST ---");
  const e2eEmail = `e2e-${Date.now()}@example.com`;
  const newCustomerData = {
    first_name: "E2E",
    last_name: "Test",
    email: e2eEmail,
    phone: "+447000000000",
    address_line_1: "E2E Test Address",
    city: "London",
    postcode: "SW1A 1AA",
  };

  const { data: insertedCustomer, error: insertErr } = await supabase
    .from("customers")
    .insert([newCustomerData])
    .select()
    .single();

  if (insertErr) {
    console.log("Anon insert attempt (expected RLS requirement or output):", insertErr.message);
  } else {
    console.log("Inserted customer ID:", insertedCustomer.id);
  }

  // 3. Test RPC get_public_proposal
  console.log("\n--- TEST 12 & 14: PUBLIC PROPOSAL & ACCEPTANCE RPC TEST ---");
  const token = "VYKDSFMWJW5N";
  const { data: pubData, error: pubErr } = await supabase.rpc("get_public_proposal", { p_token: token });
  console.log("get_public_proposal RPC status:", pubData?.status || "Error", pubErr?.message || "None");

  // Test accept_public_proposal RPC
  const { data: accData, error: accErr } = await supabase.rpc("accept_public_proposal", {
    p_token: token,
    p_signer_name: "E2E Test Client",
    p_signer_email: "e2e-client@example.com",
    p_notes: "E2E Verification Note",
  });
  console.log("accept_public_proposal RPC status:", accData?.success ? "PASS" : "FAIL", accErr?.message || accData?.error || "None");

  // Check acceptance table record
  const { data: acceptanceRows, error: accRowErr } = await supabase
    .from("proposal_acceptance")
    .select("*");
  console.log("proposal_acceptance rows count:", acceptanceRows?.length, "Error:", accRowErr?.message || "None");
  if (acceptanceRows && acceptanceRows.length > 0) {
    console.log("Sample Acceptance Record:", acceptanceRows[0]);
  }

  console.log("\n=========================================");
  console.log("LIVE SUPABASE E2E VERIFICATION COMPLETE");
  console.log("=========================================");
}

runE2eVerification();
