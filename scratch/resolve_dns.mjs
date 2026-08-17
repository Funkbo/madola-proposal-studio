import dns from "dns/promises";

async function run() {
  try {
    const res = await dns.lookup("hqdeexzbzqptedurwxbq.supabase.co");
    console.log("REST IP:", res);
  } catch (e) {
    console.error("REST DNS error:", e.message);
  }

  const poolers = [
    "aws-0-eu-west-2.pooler.supabase.com",
    "aws-0-eu-west-1.pooler.supabase.com",
    "aws-0-eu-central-1.pooler.supabase.com",
    "aws-0-us-east-1.pooler.supabase.com",
    "aws-0-us-west-1.pooler.supabase.com",
    "aws-0-ap-southeast-1.pooler.supabase.com"
  ];

  for (const pooler of poolers) {
    try {
      const res = await dns.lookup(pooler);
      console.log(`Pooler ${pooler}:`, res.address);
    } catch (e) {
      console.error(`Pooler ${pooler} error:`, e.message);
    }
  }
}

run();
