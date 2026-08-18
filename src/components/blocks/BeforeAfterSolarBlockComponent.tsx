"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function BeforeAfterSolarBlockComponent({ block, proposal }: BlockComponentProps) {
  const {
    heading = "Energy Bill Comparison: Before vs After",
    beforeLabel = "Without Solar System",
    beforeNote = "Annual grid electricity expenditure",
    afterLabel = "With Solar & Storage",
    afterNote = "Net annual grid bill after export credits",
  } = block.data || {};

  const systemSizeKw = parseFloat(proposal.systemSizeKw || "5.4");
  const annualBillBefore = Math.round(systemSizeKw * 265);
  const annualBillAfter = Math.round(annualBillBefore * 0.35);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
          <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase">{beforeLabel}</p>
          <p className="text-3xl font-extrabold text-rose-700 dark:text-rose-400">
            £{annualBillBefore.toLocaleString()}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-500">{beforeNote}</p>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">{afterLabel}</p>
          <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
            £{annualBillAfter.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">{afterNote}</p>
        </div>
      </div>
    </div>
  );
}