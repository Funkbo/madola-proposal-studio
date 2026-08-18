import { getSupabaseEnv } from "./config";
import type { CookieOptions } from "@supabase/ssr";

/**
 * Returns the appropriate Supabase client depending on the execution environment:
 * - On the server (Server Components / Server Actions / Route Handlers): uses `createServerClient` with request cookies.
 * - On the browser (Client Components): uses `createBrowserClient`.
 */
export async function getSupabaseClient() {
  const { url, key } = getSupabaseEnv();

  if (typeof window === "undefined") {
    const { createServerClient } = await import("@supabase/ssr");
    let cookieStore: { getAll: () => Array<{ name: string; value: string }>; set: (name: string, value: string, options?: CookieOptions) => void } | null = null;
    try {
      const { cookies } = await import("next/headers");
      cookieStore = await cookies();
    } catch {
      // Outside active request store context
    }

    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          if (!cookieStore) return;
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore in Server Component context
          }
        },
      },
    });
  }

  const { createBrowserClient } = await import("@supabase/ssr");
  return createBrowserClient(url, key);
}
