import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/profile";

export async function getCurrentUserProfile(): Promise<{
  user: { id: string; email: string } | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileRow) {
    return {
      user: { id: user.id, email: user.email || "" },
      profile: {
        id: user.id,
        fullName: user.email?.split("@")[0] || "Staff Member",
        role: "salesperson",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  return {
    user: { id: user.id, email: user.email || "" },
    profile: {
      id: profileRow.id,
      fullName: profileRow.full_name,
      role: profileRow.role as Profile["role"],
      avatarUrl: profileRow.avatar_url,
      createdAt: profileRow.created_at,
      updatedAt: profileRow.updated_at,
    },
  };
}
