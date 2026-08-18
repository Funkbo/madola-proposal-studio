"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";
import { Zap } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function EnergyUsageBlockComponent({ block, proposal }: BlockComponentProps) {
  const {
    heading = "Your Annual Electricity Profile",
    baselineLabel = "Baseline Annual Usage",
    billLabel = "Estimated Bill Without Solar",
  } = block.data || {};

  const totals = calculateProposalTotals(proposal);
  const systemSizeKw = parseFloat(proposal.systemSizeKw || "5.4");
  const annualConsumptionKwh = Math.round(systemSizeKw * 920);
  const annualBillBefore = Math.round(systemSizeKw * 265);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">{baselineLabel}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
            {annualConsumptionKwh.toLocaleString()} kWh
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-500 uppercase font-semibold">{billLabel}</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
            £{annualBillBefore.toLocaleString()} / yr
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
        <Zap className="w-4 h-4" />
        <span>Based on typical UK domestic usage for a {systemSizeKw} kWp system</span>
      </div>
    </div>
  );
}
