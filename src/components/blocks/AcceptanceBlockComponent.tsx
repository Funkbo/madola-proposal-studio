"use client";

import React, { useState } from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";
import { useCompanyBranding } from "@/lib/branding";
import { CheckCircle2, Zap, Lock } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  isAdmin?: boolean;
  onAcceptProposal?: () => void;
  onRequestCall?: () => void;
}

export function AcceptanceBlockComponent({
  block,
  proposal,
  isAdmin,
  onAcceptProposal,
}: BlockComponentProps) {
  const branding = useCompanyBranding();
  const {
    headline = "Ready to Accept Your Proposal?",
    termsNotice = "By accepting this proposal, you agree to reserve your installation slot. Our team will contact you to arrange your technical survey.",
  } = block.data || {};

  const [accepted, setAccepted] = useState(false);
  const [customerSignature, setCustomerSignature] = useState(proposal.customer?.name || "");

  const totals = calculateProposalTotals(proposal);

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerSignature.trim()) return;
    setAccepted(true);
    if (onAcceptProposal) onAcceptProposal();
  };

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

      {/* 3. ACCEPTANCE FORM OR CONFIRMATION */}
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
              Thank you, <span className="font-bold text-slate-900 dark:text-slate-100">{customerSignature}</span>. Our engineering team at {branding.companyName} will contact you shortly to confirm your survey date.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAccept} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Customer Name (Digital Signature) *
              </label>
              <input
                type="text"
                required
                value={customerSignature}
                onChange={(e) => setCustomerSignature(e.target.value)}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Turnkey Proposal Total
              </label>
              <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                £{totals.finalTotal.toLocaleString()} (0% VAT)
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Secure Digital Acceptance • Ref: {proposal.reference}</span>
            </div>

            <button
              type="submit"
              disabled={isAdmin}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Accept Proposal</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
