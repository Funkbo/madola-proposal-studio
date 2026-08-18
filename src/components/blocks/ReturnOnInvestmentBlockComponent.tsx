"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function ReturnOnInvestmentBlockComponent({ block, proposal }: BlockComponentProps) {
  const {
    heading = "Return on Investment (ROI)",
    roiLabel = "Year 1 ROI",
    roiNote = "Annual Return",
    breakEvenLabel = "Break-Even Point",
    breakEvenNote = "Payback Period",
    lifetimeLabel = "25-Year Total Return",
    lifetimeNote = "Estimated Net Benefit",
  } = block.data || {};

  const totals = calculateProposalTotals(proposal);
  const roiPercent = totals.finalTotal > 0 ? ((totals.annualSavings / totals.finalTotal) * 100).toFixed(1) : "6.2";
  const breakEvenYear = Math.ceil(parseFloat(totals.paybackYears));
  const lifetimeSavings = totals.annualSavings * 25;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-1">
          <p className="text-xs text-slate-400 uppercase font-semibold">{roiLabel}</p>
          <p className="text-3xl font-extrabold text-emerald-400">{roiPercent}%</p>
          <p className="text-xs text-slate-400">{roiNote}</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-xs text-slate-500 uppercase font-semibold">{breakEvenLabel}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">Year {breakEvenYear}</p>
          <p className="text-xs text-slate-500">{breakEvenNote}</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-xs text-slate-500 uppercase font-semibold">{lifetimeLabel}</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            £{lifetimeSavings.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">{lifetimeNote}</p>
        </div>
      </div>
    </div>
  );
}
