"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";
import { CreditCard, PoundSterling, ShieldCheck } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function PaymentScheduleBlockComponent({ block, proposal }: BlockComponentProps) {
  const { headline, description } = block.data || {};
  const totals = calculateProposalTotals(proposal);
  const milestones = proposal.paymentSchedule || [];

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <CreditCard className="w-4 h-4" />
          <span>Financial Milestones</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          {headline || "Payment Schedule"}
        </h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((m: any, idx: number) => {
          const calculatedAmount = (totals.finalTotal * m.percentage) / 100;

          return (
            <div
              key={m.id || idx}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    {m.percentage}% Milestone Stage
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {m.paymentMethod}
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{m.label}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{m.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Calculated Payment:</span>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  £{calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>All payments are protected under the HIES Deposit & Workmanship Guarantee Scheme.</span>
      </div>
    </div>
  );
}
