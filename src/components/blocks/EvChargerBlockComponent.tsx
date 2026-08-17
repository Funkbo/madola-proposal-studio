"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { Zap, Check, Plus, ShieldCheck } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  onToggleEvCharger?: (included: boolean) => void;
}

export function EvChargerBlockComponent({ block, proposal, onToggleEvCharger }: BlockComponentProps) {
  const { headline, description } = block.data || {};
  const evCharger = proposal.evCharger;

  if (!evCharger) return null;

  const isIncluded = evCharger.included;

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <Zap className="w-4 h-4" />
          <span>Optional Add-On</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          {headline || "Add Smart EV Charging?"}
        </h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div
        className={`p-6 rounded-2xl border transition-all ${
          isIncluded
            ? "bg-emerald-500/5 border-emerald-500/40 dark:border-emerald-500/50 shadow-md"
            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {evCharger.image && (
              <img
                src={evCharger.image}
                alt={evCharger.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            )}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                {evCharger.brand}
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{evCharger.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">{evCharger.description}</p>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>3-Year Warranty & Smart Tariff Matching</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0 w-full sm:w-auto">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Charger Price</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                +£{evCharger.price.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => onToggleEvCharger && onToggleEvCharger(!isIncluded)}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                isIncluded
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  : "bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900"
              }`}
            >
              {isIncluded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Included in Proposal</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Proposal (+£{evCharger.price})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
