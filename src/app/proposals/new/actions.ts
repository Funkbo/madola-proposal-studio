"use server";

import { parseOpenSolarPdfBuffer, extractFromText } from "@/lib/services/pdfExtractor";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { ExtractionResult } from "@/types/extraction";
import { FieldPatternConfig } from "@/lib/fieldPatterns";

/**
 * Upload extracted images (hero + roof layout) to the public proposal-images
 * bucket inside the uploading user's company folder, replacing the heavy
 * base64 data URLs with lightweight public storage URLs so they can be
 * persisted and served to the customer proposal link.
 */
async function persistExtractedImages(extraction: ExtractionResult): Promise<void> {
  if (!extraction) return;

  const candidates: Array<{ field: "roofLayoutImage" | "heroImage"; role: string }> = [
    { field: "roofLayoutImage", role: "layout" },
    { field: "heroImage", role: "hero" },
  ];

  try {
    const supabase = await getSupabaseClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user?.id) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", authUser.user.id)
      .maybeSingle();
    const companyId = profile?.company_id;
    if (!companyId) return;

    const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proposal-images`;

    for (const { field, role } of candidates) {
      const value = extraction[field];
      if (typeof value !== "string" || !value.startsWith("data:")) continue;

      const mime = value.startsWith("data:image/png") ? "image/png" : "image/jpeg";
      const ext = mime === "image/png" ? "png" : "jpg";
      const buffer = Buffer.from(value.split(",")[1] || "", "base64");
      const stamp = Date.now();
      const objectPath = `${companyId}/${stamp}_${role}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("proposal-images")
        .upload(objectPath, buffer, { contentType: mime, upsert: true });

      if (upErr) {
        console.warn(`Proposal image upload notice (${role}):`, upErr.message);
        continue;
      }

      const publicUrl = `${bucketUrl}/${objectPath}`;
      extraction[field] = publicUrl;
      if (field === "roofLayoutImage" && extraction.normalised) {
        extraction.normalised.roofLayoutImage = publicUrl;
      }
    }
  } catch (e) {
    console.warn("Proposal image persistence notice (keeping data URLs):", e);
  }
}

export interface ProcessStoredPdfParams {
  bucket: string;
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fallbackText?: string;
  fileBase64?: string;
  fieldPatterns?: FieldPatternConfig[];
}

export async function processStoredOpenSolarPdfAction(params: ProcessStoredPdfParams): Promise<{
  success: boolean;
  extraction?: ExtractionResult;
  error?: string;
}> {
  try {
    const { bucket, path, fallbackText, fileBase64, fieldPatterns } = params;

    // 1. If client provided base64 buffer directly, parse it immediately
    if (fileBase64) {
      try {
        const buffer = Buffer.from(fileBase64, "base64");
        const extraction = await parseOpenSolarPdfBuffer(buffer, fieldPatterns);
        await persistExtractedImages(extraction);

        if (extraction && extraction.normalised) {
          extraction.normalised.sourceDocument = {
            fileName: params.fileName,
            storageBucket: params.bucket,
            storagePath: params.path,
            fileSize: params.fileSize,
            mimeType: params.mimeType,
          };
        }

        return { success: true, extraction };
      } catch (base64Err) {
        console.warn("Base64 direct parse notice:", base64Err);
      }
    }

    // 2. Download PDF from Supabase Storage bucket
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.storage.from(bucket).download(path);

      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extraction = await parseOpenSolarPdfBuffer(buffer, fieldPatterns);
        await persistExtractedImages(extraction);

        // Attach source document metadata safely
        if (extraction && extraction.normalised) {
          extraction.normalised.sourceDocument = {
            fileName: params.fileName,
            storageBucket: params.bucket,
            storagePath: params.path,
            fileSize: params.fileSize,
            mimeType: params.mimeType,
          };
        }

        return { success: true, extraction };
      }
    } catch (err) {
      console.warn("Storage download notice:", err);
    }

    // 2. If fallback text is available
    if (fallbackText) {
      const extraction = extractFromText(fallbackText, [], fieldPatterns);
      if (extraction && extraction.normalised) {
        extraction.normalised.sourceDocument = {
          fileName: params.fileName,
          storageBucket: params.bucket,
          storagePath: params.path,
          fileSize: params.fileSize,
          mimeType: params.mimeType,
        };
      }
      return { success: true, extraction };
    }

    return {
      success: false,
      error: `Could not retrieve stored PDF from bucket '${bucket}' at path '${path}'.`,
    };
  } catch (e: any) {
    console.error("OpenSolar stored PDF extraction error", e);
    return { success: false, error: e.message || "Failed to extract stored OpenSolar PDF." };
  }
}
