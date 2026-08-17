console.log("ENV VARS:");
for (const [k, v] of Object.entries(process.env)) {
  if (k.toLowerCase().includes("supabase") || k.toLowerCase().includes("db") || k.toLowerCase().includes("postgres") || k.toLowerCase().includes("key") || k.toLowerCase().includes("secret") || k.toLowerCase().includes("token")) {
    console.log(`${k}: ${v}`);
  }
}
