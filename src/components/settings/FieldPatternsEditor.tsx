"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_FIELD_PATTERNS,
  FieldCategory,
  FieldPatternConfig,
  FieldTransform,
  getFieldPatterns,
  saveFieldPatterns,
  resetFieldPatterns,
  applyPatternsToText,
} from "@/lib/fieldPatterns";
import { processStoredOpenSolarPdfAction } from "@/app/proposals/new/actions";
import { ExtractionField } from "@/types/extraction";
import {
  Check,
  ClipboardList,
  FileSearch,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  TestTube2,
  UploadCloud,
  X,
} from "lucide-react";

const CATEGORY_ORDER: FieldCategory[] = [
  "Customer",
  "System",
  "Inverter",
  "Battery",
  "Technical",
  "Performance",
  "Financial",
  "Payment",
];

const TRANSFORM_OPTIONS: { value: FieldTransform; label: string }[] = [
  { value: "none", label: "Keep as text" },
  { value: "int", label: "Whole number" },
  { value: "float", label: "Decimal number" },
  { value: "lowercase", label: "Lowercase" },
  { value: "uppercase", label: "Uppercase" },
  { value: "removeSpaces", label: "Remove spaces" },
];

export function FieldPatternsEditor() {
  const [patterns, setPatterns] = useState<FieldPatternConfig[]>([]);
  const [sampleText, setSampleText] = useState<string>("");
  const [testResults, setTestResults] = useState<Map<string, { value: any }> | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // PDF dry-run test state (upload a real PDF, see extraction, nothing saved)
  const [pdfTestStep, setPdfTestStep] = useState<string>("");
  const [pdfTestResult, setPdfTestResult] = useState<Map<string, ExtractionField<any>> | null>(null);
  const [pdfTestStatus, setPdfTestStatus] = useState<string>("");
  const [pdfTestError, setPdfTestError] = useState<string | null>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  // Visual mapping state: selected field + text selection in the sample text
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>("customerName");
  const [pendingSelection, setPendingSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const sampleTextRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPatterns(getFieldPatterns());
    try {
      const sample = localStorage.getItem("madola_field_patterns_sample");
      if (sample) setSampleText(sample);
    } catch {}
  }, []);

  const handlePdfTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setPdfTestError("Please select a valid OpenSolar PDF file (.pdf).");
      return;
    }

    setPdfTestStep("Reading PDF in browser...");
    setPdfTestError(null);
    setPdfTestResult(null);
    setPdfTestStatus("");

    try {
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
        console.warn("Dry-run unpdf extraction notice:", unpdfErr);
      }

      if (!extractedText || extractedText.trim().length < 10) {
        setPdfTestStep("");
        setPdfTestError("Could not read text from this PDF. Ensure it is a valid OpenSolar proposal PDF.");
        return;
      }

      setPdfTestStep("Analysing extracted proposal data...");
      const res = await processStoredOpenSolarPdfAction({
        bucket: "proposal-pdfs",
        path: `dry-run/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
        fallbackText: extractedText,
        fieldPatterns: patterns,
      });

      setPdfTestStep("");
      if (!res.success || !res.extraction) {
        setPdfTestError(res.error || "Extraction failed.");
        return;
      }

      const fieldMap = new Map<string, ExtractionField<any>>();
      for (const cfg of patterns) {
        if (!cfg.enabled) continue;
        const val = (res.extraction as any)[cfg.key] as ExtractionField<any> | undefined;
        if (val && val.value !== "NOT FOUND IN SOURCE") {
          fieldMap.set(cfg.key, val);
        }
      }
      setPdfTestResult(fieldMap);
      setPdfTestStatus(
        `Extraction complete: ${fieldMap.size} of ${patterns.filter((p) => p.enabled).length} enabled fields matched. Nothing was saved.`
      );
    } catch (err: any) {
      setPdfTestStep("");
      setPdfTestError(err.message || "Test failed unexpectedly.");
    } finally {
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const updatePattern = (key: string, patch: Partial<FieldPatternConfig>) => {
    setPatterns((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  };

  const selectedField = patterns.find((p) => p.key === selectedFieldKey);

  // Capture text selected in the sample textarea ("take this value from here to here")
  const handleSampleTextSelection = () => {
    const el = sampleTextRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (end - start > 0) {
      setPendingSelection({ text: sampleText.substring(start, end), start, end });
    } else {
      setPendingSelection(null);
    }
  };

  const handleAssignSelection = () => {
    if (!pendingSelection || !selectedField) return;
    updatePattern(selectedField.key, { literalOverride: pendingSelection.text.trim() });
    setPendingSelection(null);
    setStatus(`Assigned "${pendingSelection.text.trim()}" to ${selectedField.label}. Save to keep it.`);
    setTimeout(() => setStatus(""), 5000);
  };

  const handleClearOverride = (key: string) => {
    updatePattern(key, { literalOverride: undefined });
    setStatus("Manual override removed. Save to keep it.");
    setTimeout(() => setStatus(""), 4000);
  };

  // Compute the match span for the selected field's pattern in the sample text
  const selectedFieldMatch = useMemo(() => {
    if (!selectedField || !selectedField.enabled || !selectedField.pattern || !sampleText) return null;
    if (selectedField.literalOverride) {
      return { start: 0, end: 0, literal: true };
    }
    try {
      const re = new RegExp(selectedField.pattern, "i");
      const m = sampleText.match(re);
      if (!m || m.index === undefined) return null;
      const idx = selectedField.group ?? 1;
      const raw = m[idx];
      if (raw === undefined) return null;
      const rawStart = sampleText.indexOf(raw, m.index);
      return { start: rawStart, end: rawStart + raw.length, literal: false };
    } catch {
      return null;
    }
  }, [selectedField, sampleText]);

  const highlightParts = useMemo(() => {
    if (!selectedFieldMatch || selectedFieldMatch.literal) return null;
    const { start, end } = selectedFieldMatch;
    if (start < 0 || end <= start || end > sampleText.length) return null;
    return {
      before: sampleText.substring(0, start),
      match: sampleText.substring(start, end),
      after: sampleText.substring(end),
    };
  }, [selectedFieldMatch, sampleText]);

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      fields: patterns.filter((p) => p.category === cat),
    })).filter((g) => g.fields.length > 0);
  }, [patterns]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveFieldPatterns(patterns);
      try {
        localStorage.setItem("madola_field_patterns_sample", sampleText);
      } catch {}
      setStatus("Field mapping saved. It will apply to the next PDF upload.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(""), 4000);
    }
  };

  const handleReset = () => {
    resetFieldPatterns();
    setPatterns(getFieldPatterns());
    setTestResults(null);
    setStatus("Restored default field mapping.");
    setTimeout(() => setStatus(""), 4000);
  };

  const handleTest = () => {
    setIsTesting(true);
    setTestResults(null);
    // Run on next tick so the spinner renders
    setTimeout(() => {
      try {
        const results = applyPatternsToText(sampleText, patterns);
        setTestResults(results);
      } catch (e: any) {
        setStatus(`Test error: ${e.message}`);
      } finally {
        setIsTesting(false);
      }
    }, 50);
  };

  const testValue = (key: string) => {
    if (!testResults) return undefined;
    const r = testResults.get(key);
    return r ? r.value : null; // null = field did not match
  };

  const matchesCount = testResults ? patterns.filter((p) => testResults.has(p.key)).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">PDF Field Mapping</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Define what the system takes out of the OpenSolar PDF. Each field below has a text pattern
              (regular expression) that matches the value in the PDF. Edit a pattern, disable fields you do
              not need, then test against sample PDF text and save. New settings apply to the next upload.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-3.5 h-3.5 mr-1" />
            {isSaving ? "Saving..." : "Save Mapping"}
          </Button>
        </div>
      </div>

      {status && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs px-4 py-3 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {status}
        </div>
      )}

      {/* PDF Upload Dry-Run Test */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
            Test PDF Upload (Dry Run — nothing is saved)
          </h3>
          <span className="ml-auto text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            {pdfTestResult ? `${pdfTestResult.size}/${patterns.filter((p) => p.enabled).length} matched` : ""}
          </span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload a real OpenSolar PDF to verify the whole upload → extraction pipeline works before
            processing real proposals. The system extracts the fields with your current mapping and
            shows the results below — it does <strong>not</strong> create a customer, a proposal, or
            save anything to the database.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfTestUpload}
              className="hidden"
              id="pdf-dry-run-input"
            />
            <label
              htmlFor="pdf-dry-run-input"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors min-h-[44px]"
            >
              {pdfTestStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {pdfTestStep || "Choose a PDF to test"}
            </label>
            {pdfTestStatus && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{pdfTestStatus}</span>
            )}
          </div>

          {pdfTestError && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs px-4 py-3">
              {pdfTestError}
            </div>
          )}

          {pdfTestResult && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="text-left font-extrabold px-3 py-2">Field</th>
                      <th className="text-left font-extrabold px-3 py-2">Extracted Value</th>
                      <th className="text-left font-extrabold px-3 py-2">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {patterns
                      .filter((p) => p.enabled)
                      .map((cfg) => {
                        const found = pdfTestResult.get(cfg.key);
                        return (
                          <tr key={cfg.key}>
                            <td className="px-3 py-2">
                              <span className="font-bold text-slate-700 dark:text-slate-200">{cfg.label}</span>
                              <code className="block text-[9px] font-mono text-slate-400">{cfg.key}</code>
                            </td>
                            <td className="px-3 py-2">
                              {found ? (
                                <span className="font-mono text-slate-800 dark:text-slate-100">
                                  {String(found.value)}
                                  {found.unit ? <span className="text-slate-400"> {found.unit}</span> : null}
                                </span>
                              ) : (
                                <span className="text-rose-500 font-bold">Not found in this PDF</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {found ? (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                    found.confidence === "high"
                                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                      : found.confidence === "medium"
                                      ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                      : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                                  }`}
                                >
                                  {found.confidence}
                                </span>
                              ) : (
                                <X className="w-3.5 h-3.5 text-rose-400" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Mapping / Test Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <TestTube2 className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            Visual Mapping — paste PDF text, select the value, assign it to a field
          </h3>
          <span className="ml-auto text-[10px] font-semibold text-slate-400">
            {testResults ? `${matchesCount} / ${patterns.filter((p) => p.enabled).length} fields matched` : "Click a field below to highlight its match"}
          </span>
        </div>
        <div className="p-4 space-y-3">
          {selectedField && (
            <div className="flex items-center gap-2 flex-wrap rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2 text-xs">
              <span className="font-extrabold text-emerald-700 dark:text-emerald-300">Active field:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedField.label}</span>
              <span className="text-slate-400">—</span>
              <span className="text-slate-600 dark:text-slate-300">
                1. Select text in the box below, 2. click <strong>Assign</strong> to tell the system
                “take this value from here to here”.
              </span>
            </div>
          )}

          <textarea
            ref={sampleTextRef}
            value={sampleText}
            onChange={(e) => {
              setSampleText(e.target.value);
              setPendingSelection(null);
            }}
            onMouseUp={handleSampleTextSelection}
            onKeyUp={handleSampleTextSelection}
            placeholder="Paste the raw text from an OpenSolar PDF here, e.g.&#10;&#10;Proposal for Amanda Ratucoko&#10;Site Address: 13 Bryn Eirlys, Bridgend, CF35 6NU&#10;Quote #: 10534548&#10;12 x 480 W Panels (LONGi LR7-54HVH-480M)&#10;System Size: 5.76 kWp&#10;Total System Price: £10,950.00"
            className="w-full min-h-[140px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 font-mono text-xs text-slate-800 dark:text-slate-200 resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />

          {/* Selection assignment bar */}
          {pendingSelection && selectedField && (
            <div className="flex items-center gap-2 flex-wrap rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Selected:</span>
              <code className="font-mono font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 max-w-[45%] truncate">
                {pendingSelection.text}
              </code>
              <span className="text-slate-500">→</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{selectedField.label}</span>
              <span className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPendingSelection(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleAssignSelection}>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Assign
                </Button>
              </span>
            </div>
          )}

          {/* Match highlight preview */}
          {selectedFieldMatch && selectedFieldMatch.literal && (
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Manual value set: “{selectedField?.literalOverride}” — the system always uses this value for{" "}
              {selectedField?.label}. Edit it below or clear it to use the pattern again.
            </div>
          )}
          {!selectedFieldMatch?.literal && highlightParts && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-3 py-2 text-xs">
              <span className="text-slate-500 font-bold mr-2">Match found:</span>
              <code className="font-mono text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words">
                {highlightParts.before}
                <mark className="bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-0.5 rounded">
                  {highlightParts.match}
                </mark>
                {highlightParts.after}
              </code>
            </div>
          )}
          {!selectedFieldMatch?.literal && !highlightParts && sampleText && selectedField && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              No match for “{selectedField.label}” in this text. Try editing the pattern below, or select the
              value in the text and assign it manually.
            </div>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] text-slate-400">
              Tip: select the exact value in the text above and click Assign to tell the system “take this value
              from here to here”.
            </span>
            <Button variant="outline" size="sm" onClick={handleTest} disabled={isTesting || !sampleText.trim()}>
              {isTesting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5 mr-1" />}
              {isTesting ? "Testing..." : "Run Test"}
            </Button>
          </div>
        </div>
      </div>

      {/* Field Groups */}
      {grouped.map((group) => (
        <div
          key={group.category}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
            <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{group.category}</h3>
            <span className="text-[10px] font-semibold text-slate-400 ml-auto">
              {group.fields.filter((f) => f.enabled).length}/{group.fields.length} enabled
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {group.fields.map((field) => {
              const tv = testValue(field.key);
              const isActive = selectedFieldKey === field.key;
              return (
                <div
                  key={field.key}
                  onClick={() => setSelectedFieldKey(field.key)}
                  className={`px-4 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-start cursor-pointer transition-colors ${
                    isActive ? "bg-emerald-50/70 dark:bg-emerald-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-950/40"
                  }`}
                >
                  {/* Label / Key / Enabled */}
                  <div className="md:col-span-3 space-y-1">
                    <div className="flex items-center gap-2">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {field.label}
                      </label>
                      {field.unit && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide">
                          {field.unit}
                        </span>
                      )}
                    </div>
                    <code className="text-[10px] font-mono text-slate-400">{field.key}</code>
                    {field.help && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{field.help}</p>
                    )}
                    {field.example && (
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 rounded px-1.5 py-0.5 inline-block">
                        e.g. {field.example}
                      </p>
                    )}
                    {field.literalOverride && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded px-1.5 py-0.5 inline-flex items-center gap-1 max-w-[180px]">
                          <Check className="w-3 h-3 shrink-0" />
                          <span className="truncate">Manual: {field.literalOverride}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearOverride(field.key);
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Clear manual override"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center gap-1.5 mt-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={(e) => updatePattern(field.key, { enabled: e.target.checked })}
                        className="w-3.5 h-3.5 accent-emerald-600"
                      />
                      <span className="text-[10px] font-bold text-slate-500">Enabled</span>
                    </label>
                  </div>

                  {/* Pattern input */}
                  <div className="md:col-span-6">
                    <input
                      type="text"
                      value={field.pattern}
                      onChange={(e) => updatePattern(field.key, { pattern: e.target.value })}
                      disabled={!field.enabled}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 font-mono text-[11px] text-slate-800 dark:text-slate-200 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    {field.pattern && field.enabled && (
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        {(() => {
                          try {
                            return new RegExp(field.pattern, "i").toString();
                          } catch {
                            return <span className="text-rose-500">Invalid regex</span>;
                          }
                        })()}
                      </p>
                    )}
                  </div>

                  {/* Transform + test result */}
                  <div className="md:col-span-3 space-y-2">
                    <select
                      value={field.transform}
                      onChange={(e) => updatePattern(field.key, { transform: e.target.value as FieldTransform })}
                      disabled={!field.enabled}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                      {TRANSFORM_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    {tv !== undefined && (
                      <div
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold ${
                          tv === null
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {tv === null ? (
                          <>
                            <X className="w-3 h-3 shrink-0" />
                            No match
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 shrink-0" />
                            <span className="truncate">{String(tv)}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}