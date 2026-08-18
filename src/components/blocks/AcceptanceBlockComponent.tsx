"use client";

import React, { useState, useRef, useEffect } from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";
import { useCompanyBranding } from "@/lib/branding";
import {
  CheckCircle2,
  Zap,
  Lock,
  ChevronRight,
  ChevronLeft,
  User,
  FileText,
  PenTool,
  Type,
  MousePointer2,
  Check,
} from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  isAdmin?: boolean;
  onAcceptProposal?: (signerName?: string, signerEmail?: string, notes?: string) => void;
  onRequestCall?: () => void;
}

interface AcceptanceFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  agreeTerms: boolean;
  signatureType: "type" | "draw";
  typedSignature: string;
}

const TERMS_ITEMS = [
  "The quoted scope of work and system design are as described throughout this proposal.",
  "Installation will be completed subject to a technical survey confirming roof structure, access and electrics.",
  "A 25% deposit is due to secure equipment procurement and scheduling; the 75% balance is due upon commissioning.",
  "All pricing is inclusive of 0% UK VAT, scaffolding, MCS certification and DNO approval.",
  "The proposed system carries manufacturer warranties as listed and our HIES insurance-backed workmanship guarantee.",
  "Grid approval (DNO) timelines may affect installation scheduling; we will keep you informed at every stage.",
];

export function AcceptanceBlockComponent({
  block,
  proposal,
  isAdmin,
  onAcceptProposal,
}: BlockComponentProps) {
  const branding = useCompanyBranding();
  const {
    headline = "Ready to Accept Your Proposal?",
    termsNotice = "Complete the short acceptance steps below to confirm your agreement and reserve your installation slot.",
  } = block.data || {};

  const totals = calculateProposalTotals(proposal);

  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState<AcceptanceFormData>({
    name: proposal.customer?.name || "",
    email: proposal.customer?.email || "",
    phone: proposal.customer?.phone || "",
    address: proposal.customer?.address || "",
    notes: "",
    agreeTerms: false,
    signatureType: "type",
    typedSignature: "",
  });
  const [drawing, setDrawing] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const steps = ["Contact Details", "Terms & Conditions", "Signatures", "Confirm & Submit"];

  useEffect(() => {
    if (step === 2 && form.signatureType === "draw") {
      setupCanvas();
    }
  }, [step, form.signatureType]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
    setSignatureEmpty(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    setDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureEmpty(true);
  };

  const signatureIsComplete =
    form.signatureType === "type"
      ? form.typedSignature.trim().length >= 3
      : !signatureEmpty;

  const canGoNext = () => {
    if (step === 0) return form.name.trim().length > 0 && /\S+@\S+\.\S+/.test(form.email);
    if (step === 1) return form.agreeTerms;
    if (step === 2) return signatureIsComplete;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGoNext()) return;
    setAccepted(true);
    if (onAcceptProposal) {
      const signerName =
        form.signatureType === "type" ? form.typedSignature.trim() : form.name.trim();
      onAcceptProposal(signerName, form.email.trim(), form.notes.trim() || undefined);
    }
  };

  const update = (patch: Partial<AcceptanceFormData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const stepBadge =
    step === 0 ? (
      <User className="w-4 h-4" />
    ) : step === 1 ? (
      <FileText className="w-4 h-4" />
    ) : step === 2 ? (
      <PenTool className="w-4 h-4" />
    ) : (
      <CheckCircle2 className="w-4 h-4" />
    );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-8 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. TOP HEADER ROW */}
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 uppercase tracking-widest">
          Acceptance & Confirmation
        </span>

        <div className="flex items-center gap-2">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.companyName} className="h-7 max-w-[140px] object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-slate-50 uppercase">
                {branding.companyName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. HEADLINE & NOTICE */}
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          {headline}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          {termsNotice}
        </p>
      </div>

      {/* 3. ACCEPTED CONFIRMATION */}
      {accepted ? (
        <div className="p-8 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-50">
              Proposal Accepted Successfully!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Thank you, <span className="font-bold text-slate-900 dark:text-slate-100">{form.name}</span>. Our engineering team at {branding.companyName} will contact you shortly to confirm your survey date.
            </p>
          </div>
          <div className="pt-2 text-xs font-mono text-emerald-700 dark:text-emerald-300 font-bold">
            Ref: {proposal.reference} | Total: £{totals.finalTotal.toLocaleString()} (0% VAT)
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP PROGRESS INDICATOR */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {steps.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      i < step
                        ? "bg-emerald-500 border-emerald-500 text-slate-950"
                        : i === step
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-300 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : <span className="text-xs font-black">{i + 1}</span>}
                  </div>
                  <span className={`hidden sm:block text-[10px] font-bold truncate w-full text-center ${
                    i === step ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                  }`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-4 sm:-mt-6 ${i < step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* STEP CONTENT */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            {/* STEP 0: CONTACT DETAILS */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  {stepBadge}
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-50">Contact Details</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update({ name: e.target.value })}
                      placeholder="e.g. John Smith"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update({ email: e.target.value })}
                      placeholder="e.g. john.smith@email.com"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="e.g. 07700 900123"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Property Address</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => update({ address: e.target.value })}
                      placeholder="e.g. 12 Orchard Road, Guildford"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Additional Installation Notes (Optional)</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => update({ notes: e.target.value })}
                      placeholder="e.g. preferred installation days or access instructions..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: TERMS & CONDITIONS */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  {stepBadge}
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-50">Terms & Conditions</h4>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 max-h-64 overflow-y-auto space-y-3 text-xs">
                  {TERMS_ITEMS.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
                <label className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => update({ agreeTerms: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    I confirm I have read and agree to the terms and conditions above, and accept the quoted scope of work for{" "}
                    <span className="font-black text-emerald-600 dark:text-emerald-400">£{totals.finalTotal.toLocaleString()}</span> (0% VAT) subject to survey confirmation.
                  </span>
                </label>
              </div>
            )}

            {/* STEP 2: SIGNATURES */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  {stepBadge}
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-50">Signatures</h4>
                </div>

                {/* Signature Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => update({ signatureType: "type" })}
                    className={`p-4 rounded-2xl border-2 text-left transition-colors ${
                      form.signatureType === "type"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Type className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-black text-xs text-slate-900 dark:text-slate-50">Type Signature</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Enter your full name in a cursive-style signature.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ signatureType: "draw" })}
                    className={`p-4 rounded-2xl border-2 text-left transition-colors ${
                      form.signatureType === "draw"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <MousePointer2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-black text-xs text-slate-900 dark:text-slate-50">Draw Signature</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Sign with your mouse or finger on the canvas below.</p>
                  </button>
                </div>

                {form.signatureType === "type" ? (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                      Digital Signature (Full Name) *
                    </label>
                    <input
                      type="text"
                      value={form.typedSignature}
                      onChange={(e) => update({ typedSignature: e.target.value })}
                      placeholder="Sign your name"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-xl font-serif italic text-slate-900 dark:text-slate-100"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                      Draw Your Signature *
                    </label>
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-36 touch-none cursor-crosshair"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="mt-2 text-[11px] font-bold text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      Clear Signature
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>Secure Digital Acceptance • Ref: {proposal.reference}</span>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRM & SUBMIT */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  {stepBadge}
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-50">Confirm & Submit</h4>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-bold text-slate-500">Customer Name</span>
                    <span className="font-black text-slate-900 dark:text-slate-50">{form.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-bold text-slate-500">Email Address</span>
                    <span className="font-black text-slate-900 dark:text-slate-50">{form.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-bold text-slate-500">Signature</span>
                    <span className="font-serif italic text-base text-slate-900 dark:text-slate-50">
                      {form.signatureType === "type" ? form.typedSignature : form.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-bold text-slate-500">Turnkey Proposal Total</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                      £{totals.finalTotal.toLocaleString()} (0% VAT)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="font-bold text-slate-500">Terms & Conditions</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">Accepted</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  By clicking <span className="font-bold">"Confirm & Accept Proposal"</span> you authorise {branding.companyName} to proceed with the quoted installation scope for £{totals.finalTotal.toLocaleString()}. A member of our team will contact you within one working day to arrange your technical survey.
                </div>
              </div>
            )}
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Secure Digital Acceptance • Ref: {proposal.reference}</span>
            </div>

            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => canGoNext() && setStep((s) => s + 1)}
                  disabled={!canGoNext()}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isAdmin}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Accept Proposal</span>
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}