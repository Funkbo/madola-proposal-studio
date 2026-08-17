import { extractFromText } from "./pdfExtractor";
import type { ExtractionResult } from "@/types/extraction";

export async function parsePdfInBrowser(file: File): Promise<ExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let text = "";

  // 1. Primary: Try unpdf extractText in browser
  try {
    const { extractText } = await import("unpdf");
    const unpdfResult: any = await extractText(bytes);
    let extractedStr = "";
    if (typeof unpdfResult?.text === "string") {
      extractedStr = unpdfResult.text;
    } else if (Array.isArray(unpdfResult?.text)) {
      extractedStr = unpdfResult.text.join("\n");
    } else if (Array.isArray(unpdfResult?.totalPages)) {
      extractedStr = unpdfResult.totalPages
        .map((p: any) => (typeof p === "string" ? p : p.text || ""))
        .join("\n");
    }

    if (extractedStr && extractedStr.trim().length > 30) {
      text = extractedStr;
    }
  } catch (e) {
    console.warn("Client unpdf extraction notice:", e);
  }

  // 2. Fallback: Pure browser string decoder & regex parenthetical extractor
  if (!text || text.trim().length < 30) {
    try {
      const decoder = new TextDecoder("latin1");
      const rawStr = decoder.decode(bytes);
      const extractedParts: string[] = [];

      const parenRegex = /\(([^()\r\n]{2,200})\)/g;
      let match: RegExpExecArray | null;
      while ((match = parenRegex.exec(rawStr)) !== null) {
        const cleaned = match[1].replace(/\\([()\\])/g, "$1").trim();
        if (cleaned.length > 1 && !/^[\x00-\x1F]+$/.test(cleaned)) {
          extractedParts.push(cleaned);
        }
      }

      const rawExtracted = extractedParts.join("\n");
      if (rawExtracted && rawExtracted.length > text.length) {
        text = rawExtracted;
      }
    } catch (decoderErr) {
      console.warn("Client decoder extraction notice:", decoderErr);
    }
  }

  // 3. Extract structured proposal data using shared text matcher
  const extraction = extractFromText(text, []);
  
  if (extraction.normalised) {
    extraction.normalised.sourceDocument = {
      fileName: file.name,
      storageBucket: "proposal-pdfs",
      storagePath: "",
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
    };
  }

  return extraction;
}
