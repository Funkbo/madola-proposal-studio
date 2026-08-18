"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function SavingsBlockComponent({ block, proposal }: BlockComponentProps) {
  const {
    heading = "First-Year Financial Breakdown",
    gridSavingsLabel = "Grid Savings",
    gridSavingsNote = "Reduced grid import",
    exportIncomeLabel = "Export Income",
    exportIncomeNote = "SEG Export Tariff",
    totalSavingsLabel = "Total Year 1 Savings",
    totalSavingsNote = "Combined Value",
  } = block.data || {};

  const totals = calculateProposalTotals(proposal);
  const gridSavings = Math.round(totals.annualSavings * 0.7);
  const exportIncome = Math.round(totals.annualSavings * 0.3);
  const totalSavings = totals.annualSavings;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">{gridSavingsLabel}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">£{gridSavings}</p>
          <p className="text-xs text-slate-500 mt-0.5">{gridSavingsNote}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">{exportIncomeLabel}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">£{exportIncome}</p>
          <p className="text-xs text-slate-500 mt-0.5">{exportIncomeNote}</p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-600 text-white text-center shadow-md">
          <p className="text-xs text-emerald-100 uppercase font-semibold">{totalSavingsLabel}</p>
          <p className="text-2xl font-extrabold text-white mt-1">£{totalSavings}</p>
          <p className="text-xs text-emerald-100 mt-0.5">{totalSavingsNote}</p>
        </div>
      </div>
    </div>
  );
}
