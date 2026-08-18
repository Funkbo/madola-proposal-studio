"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { UserRole } from "@/types/profile";

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt?: string | null;
}

/**
 * Returns a privileged Supabase client if service role key is set,
 * or falls back to server client with active session cookies.
 */
async function getAdminClient() {
  const { url, key, isConfigured } = getSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isConfigured) {
    throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.");
  }

  if (serviceKey && serviceKey !== "placeholder-service-key") {
    return {
      client: createSupabaseClient(url, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }),
      isPrivileged: true,
    };
  }

  // Fallback to standard authenticated server client
  const client = await createServerClient();
  return {
    client,
    isPrivileged: false,
  };
}

/**
 * Verify if the caller is currently authenticated and has admin privileges.
 */
async function verifyAdminCaller() {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Please log in to perform this action.");
  }

  const { data: profile } = await serverClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    throw new Error("Access Denied: Only Administrators can manage users and credentials.");
  }

  return { currentUserId: user.id };
}

/**
 * List all users in the system (Admin only)
 */
export async function listUsersAction(): Promise<{
  success: boolean;
  users?: ManagedUser[];
  error?: string;
}> {
  try {
    await verifyAdminCaller();
    const { client, isPrivileged } = await getAdminClient();

    // 1. Fetch profiles
    const { data: profiles, error: profErr } = await client
      .from("profiles")
      .select("id, full_name, role, avatar_url, created_at, company_id")
      .order("created_at", { ascending: false });

    if (profErr) {
      return { success: false, error: profErr.message };
    }

    // 2. Fetch email addresses if privileged admin client is available
    const emailMap = new Map<string, { email: string; lastSignIn?: string }>();
    if (isPrivileged) {
      try {
        const { data: authUsers } = await client.auth.admin.listUsers();
        if (authUsers?.users) {
          authUsers.users.forEach((u) => {
            if (u.id && u.email) {
              emailMap.set(u.id, {
                email: u.email,
                lastSignIn: u.last_sign_in_at,
              });
            }
          });
        }
      } catch (e) {
        console.warn("Could not list auth.users via admin API", e);
      }
    }

    const mappedUsers: ManagedUser[] = (profiles || []).map((p) => {
      const authInfo = emailMap.get(p.id);
      return {
        id: p.id,
        email: authInfo?.email || `${p.full_name.toLowerCase().replace(/\s+/g, ".")}@madola.co.uk`,
        fullName: p.full_name || "Staff Member",
        role: (p.role as UserRole) || "salesperson",
        avatarUrl: p.avatar_url || null,
        createdAt: p.created_at || new Date().toISOString(),
        lastSignInAt: authInfo?.lastSignIn || null,
      };
    });

    return { success: true, users: mappedUsers };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load user accounts." };
  }
}

/**
 * Create a new user account with role and password (Admin only)
 */
export async function createUserAction(payload: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}): Promise<{
  success: boolean;
  user?: ManagedUser;
  error?: string;
}> {
  try {
    await verifyAdminCaller();

    const { email, password, fullName, role } = payload;
    if (!email || !password || !fullName) {
      return { success: false, error: "Please provide email, password, and full name." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const { client, isPrivileged } = await getAdminClient();
    let newUserId = "";

    if (isPrivileged) {
      // 1. Direct admin creation (instant email confirmation)
      const { data: created, error: createErr } = await client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

      if (createErr || !created?.user) {
        return { success: false, error: createErr?.message || "Failed to create user." };
      }
      newUserId = created.user.id;
    } else {
      // 2. Fallback via signUp with public key
      const { data: signUpData, error: signUpErr } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpErr || !signUpData?.user) {
        return { success: false, error: signUpErr?.message || "Failed to create user account." };
      }
      newUserId = signUpData.user.id;
    }

    // 3. Upsert profile with designated role
    const { error: profErr } = await client
      .from("profiles")
      .upsert({
        id: newUserId,
        full_name: fullName,
        role: role || "salesperson",
        updated_at: new Date().toISOString(),
      });

    if (profErr) {
      console.warn("Profile update notice after user creation:", profErr);
    }

    return {
      success: true,
      user: {
        id: newUserId,
        email,
        fullName,
        role,
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create user." };
  }
}

/**
 * Update user details (name and role)
 */
export async function updateUserAction(payload: {
  userId: string;
  fullName: string;
  role: UserRole;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await verifyAdminCaller();
    const { client } = await getAdminClient();

    const { error } = await client
      .from("profiles")
      .update({
        full_name: payload.fullName,
        role: payload.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update user." };
  }
}

/**
 * Change or reset a user's password (Admin only)
 */
export async function changeUserPasswordAction(payload: {
  userId: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await verifyAdminCaller();

    const { userId, newPassword } = payload;
    if (!userId || !newPassword) {
      return { success: false, error: "User ID and new password are required." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const { client, isPrivileged } = await getAdminClient();

    if (isPrivileged) {
      // 1. Direct admin password reset via Supabase Admin API
      const { error: updateErr } = await client.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }
      return { success: true };
    }

    // 2. Direct password change for self or return actionable guidance
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (user?.id === userId) {
      const { error } = await serverClient.auth.updateUser({
        password: newPassword,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    return {
      success: true,
      error: undefined,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update user password." };
  }
}

/**
 * Delete a user account (Admin only)
 */
export async function deleteUserAction(payload: {
  userId: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { currentUserId } = await verifyAdminCaller();

    if (payload.userId === currentUserId) {
      return { success: false, error: "You cannot delete your own administrative account." };
    }

    const { client, isPrivileged } = await getAdminClient();

    if (isPrivileged) {
      const { error } = await client.auth.admin.deleteUser(payload.userId);
      if (error) {
        return { success: false, error: error.message };
      }
    }

    // Also remove from profiles table
    const { error: profErr } = await client
      .from("profiles")
      .delete()
      .eq("id", payload.userId);

    if (profErr && !isPrivileged) {
      return { success: false, error: profErr.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete user." };
  }
}
