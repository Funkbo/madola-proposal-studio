"use client";

import React, { useState, useEffect } from "react";
import { getCustomers } from "@/lib/repositories/customerRepository";
import { Customer } from "@/types/customer";
import { ExtractionResult } from "@/types/extraction";
import { processStoredOpenSolarPdfAction } from "./actions";
import { ExtractionReviewScreen } from "@/components/proposals/ExtractionReviewScreen";
import { generateSecurePublicToken } from "@/lib/utils/secureToken";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import {
  convertExtractionToInteractiveProposal,
  saveInteractiveProposal,
} from "@/lib/repositories/interactiveProposalRepository";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  User,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function NewProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetCustomerId = searchParams?.get("customerId");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(targetCustomerId || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted result state
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  useEffect(() => {
    getCustomers().then((list) => {
      setCustomers(list);
      if (targetCustomerId && list.some((c) => c.id === targetCustomerId)) {
        setSelectedCustomerId(targetCustomerId);
      } else if (list.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(list[0].id);
      }
    });
  }, [targetCustomerId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setErrorMessage("Please upload a valid OpenSolar PDF file (.pdf).");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadStep("Reading PDF in browser...");

    try {
      // 1. Extract PDF text entirely in the browser using unpdf (pure JS, no server upload needed)
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let extractedText = "";

      try {
        const { extractText } = await import("unpdf");
        const unpdfResult: any = await extractText(bytes);
        if (typeof unpdfResult?.text === "string") {
          extractedText = unpdfResult.text;
        } else if (Array.isArray(unpdfResult?.text)) {
          extractedText = unpdfResult.text.join("\n");
        }
      } catch (unpdfErr) {
        console.warn("Browser unpdf extraction notice:", unpdfErr);
      }

      // 2. Fallback: decode raw PDF strings from uncompressed parenthetical text
      if (!extractedText || extractedText.trim().length < 30) {
        const decoder = new TextDecoder("latin1");
        const rawStr = decoder.decode(bytes);
        const parts: string[] = [];
        const re = /\(([^()\r\n]{2,200})\)/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(rawStr)) !== null) {
          const cleaned = m[1].replace(/\\([()\\])/g, "$1").trim();
          if (cleaned.length > 1 && !/^[\x00-\x1F]+$/.test(cleaned)) {
            parts.push(cleaned);
          }
        }
        if (parts.length > 0) {
          extractedText = parts.join("\n");
        }
      }

      if (!extractedText || extractedText.trim().length < 10) {
        setIsUploading(false);
        setErrorMessage("Could not read text from PDF. Please ensure this is a valid OpenSolar proposal PDF.");
        return;
      }

      // 3. Send ONLY the extracted text (~few KB) to server action (bypasses Vercel 4.5MB body limit)
      setUploadStep("Analysing extracted proposal data...");
      const res = await processStoredOpenSolarPdfAction({
        bucket: "proposal-pdfs",
        path: `browser/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
        fallbackText: extractedText,
      });

      if (!res.success || !res.extraction) {
        setIsUploading(false);
        setErrorMessage(`Extraction Failed: ${res.error || "Could not extract data from OpenSolar PDF."}`);
        return;
      }

      // 4. Synchronize customer profile
      setUploadStep("Data extracted! Synchronizing customer profile...");
      try {
        const { autoCreateCustomerFromExtraction } = await import("@/lib/repositories/customerRepository");
        await autoCreateCustomerFromExtraction(res.extraction);
      } catch (custErr) {
        console.warn("Auto customer creation notice:", custErr);
      }

      setUploadStep("Extraction complete!");
      setExtractionResult(res.extraction);
    } catch (err: any) {
      console.error("PDF upload handler error:", err);
      setErrorMessage(`Upload Error: ${err.message || "Failed to process OpenSolar PDF."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDraft = async (data: ExtractionResult, templateId?: string) => {
    try {
      const token = generateSecurePublicToken();
      const interactiveData = convertExtractionToInteractiveProposal(data, token, "draft", templateId);
      await saveInteractiveProposal(interactiveData);
      router.push(`/p/${token}`);
    } catch (e: any) {
      console.error("Save Draft Error:", e);
      setErrorMessage(`Save Draft Error: ${e.message || "Failed to save draft proposal."}`);
    }
  };

  const handlePublish = async (data: ExtractionResult, templateId?: string) => {
    try {
      const token = generateSecurePublicToken();
      const interactiveData = convertExtractionToInteractiveProposal(data, token, "published", templateId);
      await saveInteractiveProposal(interactiveData);
      router.push(`/p/${token}`);
    } catch (e: any) {
      console.error("Publish Error:", e);
      setErrorMessage(`Publish Error: ${e.message || "Failed to publish proposal."}`);
    }
  };

  const handlePreview = async (data: ExtractionResult, templateId?: string) => {
    try {
      const token = generateSecurePublicToken();
      const interactiveData = convertExtractionToInteractiveProposal(data, token, "published", templateId);
      await saveInteractiveProposal(interactiveData);
      window.open(`/p/${token}`, "_blank");
    } catch (e: any) {
      console.error("Preview Error:", e);
      setErrorMessage(`Preview Error: ${e.message || "Failed to generate proposal preview."}`);
    }
  };

  if (extractionResult) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <ExtractionReviewScreen
          initialExtraction={extractionResult}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onPreview={handlePreview}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 select-none">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Proposal Creator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Create New Solar Proposal</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select a customer and upload an OpenSolar PDF via direct company-isolated Supabase Storage.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex flex-col gap-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Storage / Upload Error</span>
          </div>
          <p className="text-xs text-rose-800 break-words pl-6">{errorMessage}</p>
        </div>
      )}

      {/* Step 1: OpenSolar PDF Upload Dropzone */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            <span>Upload OpenSolar Proposal PDF</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            ⚡ Automatic Customer Creation
          </span>
        </div>

        {isUploading ? (
          <div className="p-12 text-center bg-emerald-50/50 border-2 border-dashed border-emerald-300 rounded-2xl space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-emerald-900">{uploadStep}</p>
              <p className="text-xs text-emerald-600 mt-1">Extracting data & creating customer record in Supabase database.</p>
            </div>
          </div>
        ) : (
          <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 transition-all rounded-2xl p-10 text-center space-y-3 cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-700 w-14 h-14 mx-auto flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900">Click to upload or drag & drop OpenSolar PDF</p>
              <p className="text-xs text-slate-500 mt-1">
                The system will automatically extract customer info, create the customer in your database, and populate your Master Template!
              </p>
            </div>
            <span className="inline-flex px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700">
              Select OpenSolar_Proposal(3).pdf
            </span>
          </div>
        )}
      </div>

      {/* Optional: Select Existing Customer Override */}
      {customers.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <User className="w-4 h-4 text-slate-500" />
            <span>Optional: Link to Existing Customer Record</span>
          </div>
          <select
            id="customerSelect"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          >
            <option value="">Auto-create new customer from PDF (Recommended)</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} — {c.addressLine1}, {c.postcode} ({c.email})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
