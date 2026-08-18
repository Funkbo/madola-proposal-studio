import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/config";

export interface MediaAsset {
  id: string;
  companyId?: string | null;
  name: string;
  storagePath?: string | null;
  publicUrl: string;
  mimeType?: string | null;
  fileSize?: number | null;
  type: string;
  category: string;
  alt?: string | null;
  createdAt?: string;
}

const LOCAL_STORAGE_MEDIA_KEY = "madola_media_library";
const BUCKET_NAME = "proposal-media";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB application limit
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

function getLocalMediaAssets(): MediaAsset[] {
  if (typeof window === "undefined") return [];
  if ((window as any).__MADOLA_MEDIA_LIBRARY_CACHE__) {
    return (window as any).__MADOLA_MEDIA_LIBRARY_CACHE__;
  }
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_MEDIA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      (window as any).__MADOLA_MEDIA_LIBRARY_CACHE__ = parsed;
      return parsed;
    }
  } catch (e) {
    console.error("Error reading local media assets fallback", e);
  }
  return [];
}

function saveLocalMediaAsset(asset: MediaAsset) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalMediaAssets();
    // Keep top 12 assets to prevent localStorage overflow
    const updated = [asset, ...current.filter((a) => a.id !== asset.id)].slice(0, 12);
    (window as any).__MADOLA_MEDIA_LIBRARY_CACHE__ = updated;
    try {
      localStorage.setItem(LOCAL_STORAGE_MEDIA_KEY, JSON.stringify(updated));
    } catch (quotaErr) {
      console.warn("localStorage quota exceeded for media assets, using in-memory cache", quotaErr);
    }
  } catch (e) {
    console.error("Error saving local media asset fallback", e);
  }
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          companyId: row.company_id,
          name: row.name,
          storagePath: row.storage_path,
          publicUrl: row.public_url,
          mimeType: row.mime_type,
          fileSize: Number(row.file_size) || 0,
          type: row.type || "image",
          category: row.category || "general",
          alt: row.alt,
          createdAt: row.created_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase getMediaAssets failed; using local fallback", e);
    }
  }

  return getLocalMediaAssets();
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  if (!id) return null;
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          companyId: data.company_id,
          name: data.name,
          storagePath: data.storage_path,
          publicUrl: data.public_url,
          mimeType: data.mime_type,
          fileSize: Number(data.file_size) || 0,
          type: data.type || "image",
          category: data.category || "general",
          alt: data.alt,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn("Supabase getMediaAssetById failed; using local fallback", e);
    }
  }

  const local = getLocalMediaAssets();
  return local.find((a) => a.id === id || a.publicUrl === id) || null;
}

export async function uploadMediaAsset(
  file: File,
  metadata?: { category?: string; alt?: string; name?: string }
): Promise<{ asset: MediaAsset | null; error: string | null }> {
  // 1. File Validation
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      asset: null,
      error: `Invalid file type "${file.type}". Allowed types: JPEG, PNG, WebP, SVG, MP4, WebM, MOV, MKV.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      asset: null,
      error: `File size exceeds the 25MB limit (File size: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  const { isConfigured } = getSupabaseEnv();
  const assetId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const category = metadata?.category || "general";
  const name = metadata?.name || file.name;
  const alt = metadata?.alt || name;
  const isVideo = file.type.startsWith("video/");
  const assetType = isVideo ? "video" : "image";

  if (isConfigured) {
    try {
      const supabase = createClient();
      const companyId = "c0a80101-0000-0000-0000-000000000001"; // Madola Energy Company ID
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `companies/${companyId}/media/${assetId}/${sanitizedFilename}`;

      // Upload file object to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.warn("Supabase Storage upload error:", uploadError.message);
      }

      // Obtain public URL for asset
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData?.publicUrl || storagePath;

      // Insert record into media_assets table
      const { data: dbData, error: dbError } = await supabase
        .from("media_assets")
        .insert({
          company_id: companyId,
          name,
          storage_path: storagePath,
          public_url: publicUrl,
          mime_type: file.type,
          file_size: file.size,
          type: assetType,
          category,
          alt,
        })
        .select()
        .single();

      if (!dbError && dbData) {
        const created: MediaAsset = {
          id: dbData.id,
          companyId: dbData.company_id,
          name: dbData.name,
          storagePath: dbData.storage_path,
          publicUrl: dbData.public_url,
          mimeType: dbData.mime_type,
          fileSize: Number(dbData.file_size) || file.size,
          type: dbData.type,
          category: dbData.category,
          alt: dbData.alt,
          createdAt: dbData.created_at,
        };
        saveLocalMediaAsset(created);
        return { asset: created, error: null };
      }
    } catch (e: any) {
      console.warn("Supabase uploadMediaAsset exception; falling back", e);
    }
  }

  // Fallback if Supabase storage upload is unavailable
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;

      if (isVideo) {
        const fallbackAsset: MediaAsset = {
          id: assetId,
          name,
          publicUrl: rawDataUrl,
          mimeType: file.type,
          fileSize: file.size,
          type: "video",
          category,
          alt,
          createdAt: new Date().toISOString(),
        };
        saveLocalMediaAsset(fallbackAsset);
        resolve({ asset: fallbackAsset, error: null });
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxWidth = 1200;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const compressedUrl = ctx
          ? (ctx.drawImage(img, 0, 0, width, height), canvas.toDataURL("image/jpeg", 0.75))
          : rawDataUrl;

        const fallbackAsset: MediaAsset = {
          id: assetId,
          name,
          publicUrl: compressedUrl,
          mimeType: "image/jpeg",
          fileSize: compressedUrl.length,
          type: "image",
          category,
          alt,
          createdAt: new Date().toISOString(),
        };
        saveLocalMediaAsset(fallbackAsset);
        resolve({ asset: fallbackAsset, error: null });
      };
      img.onerror = () => {
        const fallbackAsset: MediaAsset = {
          id: assetId,
          name,
          publicUrl: rawDataUrl,
          mimeType: file.type,
          fileSize: file.size,
          type: "image",
          category,
          alt,
          createdAt: new Date().toISOString(),
        };
        saveLocalMediaAsset(fallbackAsset);
        resolve({ asset: fallbackAsset, error: null });
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve({ asset: null, error: "Failed to read image file." });
    reader.readAsDataURL(file);
  });
}

export async function updateMediaAsset(
  id: string,
  metadata: { name?: string; category?: string; alt?: string }
): Promise<{ asset: MediaAsset | null; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("media_assets")
        .update({
          name: metadata.name,
          category: metadata.category,
          alt: metadata.alt,
        })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const updated: MediaAsset = {
          id: data.id,
          companyId: data.company_id,
          name: data.name,
          storagePath: data.storage_path,
          publicUrl: data.public_url,
          mimeType: data.mime_type,
          fileSize: Number(data.file_size) || 0,
          type: data.type,
          category: data.category,
          alt: data.alt,
          createdAt: data.created_at,
        };
        saveLocalMediaAsset(updated);
        return { asset: updated, error: null };
      }
    } catch (e: any) {
      console.warn("Supabase updateMediaAsset failed; using local fallback", e);
    }
  }

  const local = getLocalMediaAssets();
  const target = local.find((a) => a.id === id);
  if (!target) return { asset: null, error: "Media asset not found." };
  const updated: MediaAsset = {
    ...target,
    name: metadata.name || target.name,
    category: metadata.category || target.category,
    alt: metadata.alt || target.alt,
  };
  saveLocalMediaAsset(updated);
  return { asset: updated, error: null };
}

export async function deleteMediaAsset(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  // 1. Safe Reference Check
  if (isConfigured) {
    try {
      const supabase = createClient();

      // Check if referenced in company branding
      const { data: brandingRef } = await supabase
        .from("company_branding")
        .select("id")
        .eq("logo_reference", id)
        .maybeSingle();

      if (brandingRef) {
        return {
          success: false,
          error: "Cannot delete media asset because it is currently set as the official Company Branding Logo.",
        };
      }
    } catch (e) {}
  }

  if (isConfigured) {
    try {
      const supabase = createClient();

      // Get storage path before deletion
      const { data: asset } = await supabase
        .from("media_assets")
        .select("storage_path")
        .eq("id", id)
        .maybeSingle();

      if (asset?.storage_path) {
        await supabase.storage.from(BUCKET_NAME).remove([asset.storage_path]);
      }

      const { error } = await supabase.from("media_assets").delete().eq("id", id);
      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.warn("Supabase deleteMediaAsset exception", e);
    }
  }

  // Remove from local storage
  if (typeof window !== "undefined") {
    const local = getLocalMediaAssets().filter((a) => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_MEDIA_KEY, JSON.stringify(local));
  }

  return { success: true, error: null };
}

export async function resolveMediaUrl(reference: string): Promise<string> {
  if (!reference) return "";
  if (reference.startsWith("http://") || reference.startsWith("https://") || reference.startsWith("data:image/") || reference.startsWith("data:video/")) {
    return reference;
  }

  const asset = await getMediaAssetById(reference);
  if (asset?.publicUrl) {
    return asset.publicUrl;
  }

  return reference;
}
