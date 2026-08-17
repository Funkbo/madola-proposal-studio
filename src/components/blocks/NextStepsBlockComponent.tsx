"use client";

import React from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { Milestone, CheckCircle2 } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
}

export function NextStepsBlockComponent({ block }: BlockComponentProps) {
  const steps = block.data?.steps || [];

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <Milestone className="w-4 h-4" />
          <span>Customer Journey</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">Next Steps to Installation</h2>
        <p className="text-sm text-slate-500">Your step-by-step roadmap from proposal acceptance to commissioning.</p>
      </div>

      <div className="space-y-4">
        {steps.map((st: any, idx: number) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-4"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
              {st.stepNum || idx + 1}
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{st.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
