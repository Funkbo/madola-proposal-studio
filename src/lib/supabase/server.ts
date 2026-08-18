import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./config";
import type { CookieOptions } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component context - safe to ignore cookie sets
        }
      },
    },
  });
}
