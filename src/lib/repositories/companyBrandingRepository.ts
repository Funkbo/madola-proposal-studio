import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { getSupabaseEnv } from "@/lib/supabase/config";

export interface CompanyBrandingData {
  companyId: string;
  companyName: string;
  logoPath: string | null;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  sidebarBackgroundColor: string;
  sidebarTextColor: string;
  loginBackgroundColor: string;
  loginCardColor: string;
  buttonColor: string;
  buttonTextColor: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
}

export interface StorageAsset {
  name: string;
  path: string;
  url: string;
  createdAt: string;
}

const BUCKET_NAME = "company-branding";
export const DEFAULT_COMPANY_ID = "5c813b60-7b97-47c1-9457-11f98adfb9b7";
export const STATIC_FALLBACK_LOGO_URL = "/branding/madola-energy-logo.svg";
export const PUBLIC_SUPABASE_LOGO_URL =
  "https://hqdeexzbzqptedurwxbq.supabase.co/storage/v1/object/public/company-branding/Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp";

export const DEFAULT_BRANDING_DATA: CompanyBrandingData = {
  companyId: DEFAULT_COMPANY_ID,
  companyName: "Madola Energy",
  logoPath: "Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp",
  logoUrl: PUBLIC_SUPABASE_LOGO_URL,
  primaryColor: "#10b981",
  secondaryColor: "#0f172a",
  sidebarBackgroundColor: "#0b1428",
  sidebarTextColor: "#ffffff",
  loginBackgroundColor: "#f5f7f6",
  loginCardColor: "#ffffff",
  buttonColor: "#10b981",
  buttonTextColor: "#ffffff",
  website: "https://madola.co.uk",
  contactEmail: "proposals@madola.co.uk",
  contactPhone: "+44 (0) 800 123 4567",
  officeAddress: "Madola House, Richmond, Surrey, UK",
};

/**
 * Apply CSS custom properties dynamically to documentElement.
 */
export function applyThemeCssVariables(data: Partial<CompanyBrandingData>) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--brand-primary", data.primaryColor || "#10b981");
  root.style.setProperty("--brand-secondary", data.secondaryColor || "#0f172a");
  root.style.setProperty("--brand-sidebar-background", data.sidebarBackgroundColor || "#0b1428");
  root.style.setProperty("--brand-sidebar-text", data.sidebarTextColor || "#ffffff");
  root.style.setProperty("--brand-login-background", data.loginBackgroundColor || "#f5f7f6");
  root.style.setProperty("--brand-login-card", data.loginCardColor || "#ffffff");
  root.style.setProperty("--brand-button", data.buttonColor || "#10b981");
  root.style.setProperty("--brand-button-text", data.buttonTextColor || "#ffffff");
}

/**
 * Construct public URL for an asset in company-branding bucket.
 */
export function resolveStoragePublicUrl(logoPath: string | null): string {
  if (!logoPath) return PUBLIC_SUPABASE_LOGO_URL;

  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
    return logoPath;
  }

  if (logoPath.startsWith("/")) {
    if (logoPath.startsWith("/storage/v1/object/public/")) {
      const { url } = getSupabaseEnv();
      return `${url.replace(/\/$/, "")}${logoPath}`;
    }
    return logoPath;
  }

  const { url, isConfigured } = getSupabaseEnv();
  if (isConfigured && url) {
    return `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET_NAME}/${logoPath}`;
  }

  return PUBLIC_SUPABASE_LOGO_URL;
}

/**
 * Retrieve persistent company branding from Supabase.
 * Flow: auth.uid() -> profiles.company_id -> company_branding -> logo_path -> getPublicUrl()
 */
export async function getCompanyBranding(): Promise<CompanyBrandingData> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      let companyId = DEFAULT_COMPANY_ID;

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.company_id) {
          companyId = profile.company_id;
        }
      }

      const { data: brandingRow, error: brandingErr } = await supabase
        .from("company_branding")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (!brandingErr && brandingRow) {
        const logoPath = brandingRow.logo_path || brandingRow.logo_reference || null;
        let logoUrl = resolveStoragePublicUrl(logoPath);

        if (brandingRow.logo_url && brandingRow.logo_url.startsWith("http")) {
          logoUrl = brandingRow.logo_url;
        }

        const result: CompanyBrandingData = {
          companyId: brandingRow.company_id || companyId,
          companyName: brandingRow.company_name || DEFAULT_BRANDING_DATA.companyName,
          logoPath,
          logoUrl: logoUrl || PUBLIC_SUPABASE_LOGO_URL,
          primaryColor: brandingRow.primary_color || DEFAULT_BRANDING_DATA.primaryColor,
          secondaryColor: brandingRow.secondary_color || DEFAULT_BRANDING_DATA.secondaryColor,
          sidebarBackgroundColor: brandingRow.sidebar_background_color || DEFAULT_BRANDING_DATA.sidebarBackgroundColor,
          sidebarTextColor: brandingRow.sidebar_text_color || DEFAULT_BRANDING_DATA.sidebarTextColor,
          loginBackgroundColor: brandingRow.login_background_color || DEFAULT_BRANDING_DATA.loginBackgroundColor,
          loginCardColor: brandingRow.login_card_color || DEFAULT_BRANDING_DATA.loginCardColor,
          buttonColor: brandingRow.button_color || DEFAULT_BRANDING_DATA.buttonColor,
          buttonTextColor: brandingRow.button_text_color || DEFAULT_BRANDING_DATA.buttonTextColor,
          website: brandingRow.website || DEFAULT_BRANDING_DATA.website,
          contactEmail: brandingRow.email || brandingRow.contact_email || DEFAULT_BRANDING_DATA.contactEmail,
          contactPhone: brandingRow.phone || brandingRow.contact_phone || DEFAULT_BRANDING_DATA.contactPhone,
          officeAddress: brandingRow.address || brandingRow.office_address || DEFAULT_BRANDING_DATA.officeAddress,
        };

        applyThemeCssVariables(result);
        return result;
      }
    } catch (e) {
      console.warn("getCompanyBranding repository query failed", e);
    }
  }

  applyThemeCssVariables(DEFAULT_BRANDING_DATA);
  return DEFAULT_BRANDING_DATA;
}

/**
 * Retrieve public-safe company branding fields for unauthenticated /login view.
 * Exposes ONLY minimum visual fields (logo, colors, company name) without opening RLS.
 */
export async function getPublicCompanyBranding(): Promise<Partial<CompanyBrandingData>> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      let { data, error } = await supabase.rpc("get_public_login_branding");

      if (error || !data || data.length === 0) {
        const fallbackRes = await supabase.rpc("get_public_company_branding");
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (!error && data && data.length > 0) {
        const row = data[0];
        let logoUrl = resolveStoragePublicUrl(row.logo_url);
        if (row.logo_url && row.logo_url.startsWith("http")) {
          logoUrl = row.logo_url;
        }

        const result: Partial<CompanyBrandingData> = {
          companyName: row.company_name || DEFAULT_BRANDING_DATA.companyName,
          logoUrl: logoUrl || PUBLIC_SUPABASE_LOGO_URL,
          primaryColor: row.primary_color || DEFAULT_BRANDING_DATA.primaryColor,
          secondaryColor: row.secondary_color || DEFAULT_BRANDING_DATA.secondaryColor,
          loginBackgroundColor: row.login_background_color || DEFAULT_BRANDING_DATA.loginBackgroundColor,
          loginCardColor: row.login_card_color || DEFAULT_BRANDING_DATA.loginCardColor,
          buttonColor: row.button_color || DEFAULT_BRANDING_DATA.buttonColor,
          buttonTextColor: row.button_text_color || DEFAULT_BRANDING_DATA.buttonTextColor,
        };

        applyThemeCssVariables(result);
        return result;
      }
    } catch (e) {
      console.warn("getPublicCompanyBranding failed", e);
    }
  }

  applyThemeCssVariables(DEFAULT_BRANDING_DATA);
  return {
    companyName: DEFAULT_BRANDING_DATA.companyName,
    logoUrl: PUBLIC_SUPABASE_LOGO_URL,
    primaryColor: DEFAULT_BRANDING_DATA.primaryColor,
    secondaryColor: DEFAULT_BRANDING_DATA.secondaryColor,
    loginBackgroundColor: DEFAULT_BRANDING_DATA.loginBackgroundColor,
    loginCardColor: DEFAULT_BRANDING_DATA.loginCardColor,
    buttonColor: DEFAULT_BRANDING_DATA.buttonColor,
    buttonTextColor: DEFAULT_BRANDING_DATA.buttonTextColor,
  };
}

/**
 * Upload binary company logo file directly to company-branding bucket,
 * update public.company_branding (logo_path & logo_url), and return updated branding.
 */
export async function uploadCompanyLogo(
  file: File
): Promise<{ branding: CompanyBrandingData | null; error: string | null }> {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      branding: null,
      error: `Invalid image type "${file.type}". Allowed types: PNG, JPEG, WebP, SVG.`,
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      branding: null,
      error: `File size exceeds the 10MB limit.`,
    };
  }

  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    return { branding: null, error: "Supabase client is not configured." };
  }

  try {
    const supabase = await getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    let companyId = DEFAULT_COMPANY_ID;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.company_id) {
        companyId = profile.company_id;
      }
    }

    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${companyId}/logo/${timestamp}_${sanitizedFilename}`;

    // 1. Upload binary file directly to company-branding bucket
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadErr) {
      console.error("Supabase Storage upload error:", uploadErr.message);
      return { branding: null, error: `Storage Upload Error: ${uploadErr.message}` };
    }

    // 2. Resolve Public URL via Supabase Storage client
    const { data: pubUrlObj } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const publicUrl = pubUrlObj?.publicUrl || resolveStoragePublicUrl(storagePath);

    // 3. Update public.company_branding table
    const { data: updatedRow, error: updateErr } = await supabase
      .from("company_branding")
      .update({
        logo_path: storagePath,
        logo_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId)
      .select()
      .maybeSingle();

    if (!updatedRow && !updateErr) {
      // Row doesn't exist yet, insert
      await supabase
        .from("company_branding")
        .insert({
          company_id: companyId,
          logo_path: storagePath,
          logo_url: publicUrl,
          updated_at: new Date().toISOString(),
        });
    }

    const fresh = await getCompanyBranding();
    applyThemeCssVariables(fresh);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("madola_branding_updated"));
    }

    return { branding: fresh, error: null };
  } catch (e: any) {
    console.error("uploadCompanyLogo exception", e);
    return { branding: null, error: e.message || "Failed to upload logo." };
  }
}

/**
 * Update metadata and theme colors in public.company_branding.
 * Explicitly maps camelCase props to snake_case column names.
 * Prefers UPDATE to avoid triggering INSERT RLS evaluation when updating existing row.
 */
export async function updateCompanyBranding(
  data: Partial<CompanyBrandingData>
): Promise<{ branding: CompanyBrandingData | null; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    return { branding: null, error: "Supabase client is not configured." };
  }

  try {
    const supabase = await getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    let companyId = DEFAULT_COMPANY_ID;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.company_id) {
        companyId = profile.company_id;
      }
    }

    // Explicit snake_case column payload mapping
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.primaryColor !== undefined) payload.primary_color = data.primaryColor;
    if (data.secondaryColor !== undefined) payload.secondary_color = data.secondaryColor;
    if (data.sidebarBackgroundColor !== undefined) payload.sidebar_background_color = data.sidebarBackgroundColor;
    if (data.sidebarTextColor !== undefined) payload.sidebar_text_color = data.sidebarTextColor;
    if (data.loginBackgroundColor !== undefined) payload.login_background_color = data.loginBackgroundColor;
    if (data.loginCardColor !== undefined) payload.login_card_color = data.loginCardColor;
    if (data.buttonColor !== undefined) payload.button_color = data.buttonColor;
    if (data.buttonTextColor !== undefined) payload.button_text_color = data.buttonTextColor;
    if (data.logoPath !== undefined) payload.logo_path = data.logoPath;
    if (data.logoUrl !== undefined) payload.logo_url = data.logoUrl;
    if (data.website !== undefined) payload.website = data.website;
    if (data.contactEmail !== undefined) payload.contact_email = data.contactEmail;
    if (data.contactPhone !== undefined) payload.contact_phone = data.contactPhone;
    if (data.officeAddress !== undefined) payload.office_address = data.officeAddress;

    // STEP 3: PREFER UPDATE RATHER THAN UPSERT
    let { data: updatedRow, error: updateErr } = await supabase
      .from("company_branding")
      .update(payload)
      .eq("company_id", companyId)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error("Supabase company_branding update error:", updateErr.message);
      return { branding: null, error: `Supabase Error: ${updateErr.message}` };
    }

    // If no row was updated (because initial row for company doesn't exist), perform INSERT
    if (!updatedRow) {
      const insertPayload = {
        ...payload,
        company_id: companyId,
      };

      const { data: insertedRow, error: insertErr } = await supabase
        .from("company_branding")
        .insert(insertPayload)
        .select()
        .maybeSingle();

      if (insertErr) {
        console.error("Supabase company_branding insert error:", insertErr.message);
        return { branding: null, error: `Supabase Error: ${insertErr.message}` };
      }

      updatedRow = insertedRow;
    }

    // Re-fetch source of truth from Supabase
    const fresh = await getCompanyBranding();
    applyThemeCssVariables(fresh);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("madola_branding_updated"));
    }

    return { branding: fresh, error: null };
  } catch (e: any) {
    return { branding: null, error: e.message || "Failed to update company branding." };
  }
}

/**
 * Retrieve list of assets directly from company-branding Supabase Storage bucket.
 */
export async function getCompanyBrandingAssets(): Promise<StorageAsset[]> {
  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured) return [];

  try {
    const supabase = await getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    let companyId = DEFAULT_COMPANY_ID;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.company_id) {
        companyId = profile.company_id;
      }
    }

    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${companyId}/logo`, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (error || !files || files.length === 0) {
      const { data: rootFiles } = await supabase.storage.from(BUCKET_NAME).list("", { limit: 50 });
      if (rootFiles) {
        return rootFiles
          .filter((f) => f.name && !f.name.startsWith("."))
          .map((f) => ({
            name: f.name,
            path: f.name,
            url: resolveStoragePublicUrl(f.name),
            createdAt: f.created_at || new Date().toISOString(),
          }));
      }
      return [];
    }

    return files
      .filter((f) => f.name && !f.name.startsWith("."))
      .map((f) => {
        const fullPath = `${companyId}/logo/${f.name}`;
        return {
          name: f.name,
          path: fullPath,
          url: resolveStoragePublicUrl(fullPath),
          createdAt: f.created_at || new Date().toISOString(),
        };
      });
  } catch (e) {
    console.warn("getCompanyBrandingAssets exception", e);
    return [];
  }
}
