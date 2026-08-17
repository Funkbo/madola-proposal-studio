import { NextRequest, NextResponse } from "next/server";
import { parseOpenSolarPdfBuffer, extractFromText } from "@/lib/services/pdfExtractor";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided in request." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Run PDF extraction in serverless environment
    const extraction = await parseOpenSolarPdfBuffer(buffer);

    // 2. Attempt background upload to Supabase Storage if configured
    let storagePath = "";
    try {
      const supabase = await getSupabaseClient();
      const bucketName = "proposal-pdfs";
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      storagePath = `public/opensolar/${timestamp}_${sanitizedFileName}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (!uploadErr && uploadData?.path) {
        storagePath = uploadData.path;
      }
    } catch (sErr) {
      console.warn("Storage upload notice (proposal extraction preserved):", sErr);
    }

    // Attach source document metadata
    if (extraction && extraction.normalised) {
      extraction.normalised.sourceDocument = {
        fileName: file.name,
        storageBucket: "proposal-pdfs",
        storagePath: storagePath,
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
      };
    }

    return NextResponse.json({ success: true, extraction });
  } catch (err: any) {
    console.error("PDF Extraction API Route Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process OpenSolar PDF." },
      { status: 500 }
    );
  }
}
