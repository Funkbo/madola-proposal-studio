export function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://hqdeexzbzqptedurwxbq.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_fNYavZFq5YFG9cWGnwj4UA_Rs_FZWGo";

  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes("placeholder-project-id") &&
    !key.includes("placeholder-publishable-key")
  );

  return { url, key, isConfigured };
}
