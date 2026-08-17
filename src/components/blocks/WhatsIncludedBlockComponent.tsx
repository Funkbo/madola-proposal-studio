"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { CheckCircle2, ShieldCheck, Package } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function WhatsIncludedBlockComponent({ block, proposal }: BlockComponentProps) {
  const items = block.data?.items || [];

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <Package className="w-4 h-4" />
          <span>Turnkey System Components</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">What's Included In Your Package</h2>
        <p className="text-sm text-slate-500">
          Complete turnkey supply, installation, DNO application, scaffolding, and 25-year performance warranty.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-4"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            )}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                  {item.brand}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                  Included
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.spec}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
