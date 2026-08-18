"use server";

import { parseOpenSolarPdfBuffer, extractFromText } from "@/lib/services/pdfExtractor";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { ExtractionResult } from "@/types/extraction";
import { FieldPatternConfig } from "@/lib/fieldPatterns";

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
