"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function SelfConsumptionBlockComponent({ block, proposal }: BlockComponentProps) {
  const {
    heading = "Where Will Your Solar Energy Go?",
    subtitle = "Distribution breakdown of your annual solar generation",
    directToHomeLabel = "Direct to Home",
    directToHomeKwh = 2450,
    directToHomeNote = "Immediate Daytime Usage",
    batteryToHomeLabel = "Stored in Battery",
    batteryToHomeKwh = 1750,
    batteryToHomeNote = "Evening Household Power",
    exportToGridLabel = "Exported to Grid",
    exportToGridKwh = 720,
    exportToGridNote = "Smart Export Guarantee (SEG)",
  } = block.data || {};

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{directToHomeLabel}</p>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {directToHomeKwh.toLocaleString()} kWh
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">{directToHomeNote}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-1">
          <p className="text-xs font-bold text-slate-300">{batteryToHomeLabel}</p>
          <p className="text-2xl font-extrabold text-amber-300">
            {batteryToHomeKwh.toLocaleString()} kWh
          </p>
          <p className="text-xs text-slate-400">{batteryToHomeNote}</p>
        </div>

        <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center space-y-1">
          <p className="text-xs font-bold text-sky-800 dark:text-sky-300">{exportToGridLabel}</p>
          <p className="text-2xl font-extrabold text-sky-700 dark:text-sky-400">
            {exportToGridKwh.toLocaleString()} kWh
          </p>
          <p className="text-xs text-sky-600 dark:text-sky-500">{exportToGridNote}</p>
        </div>
      </div>
    </div>
  );
}
