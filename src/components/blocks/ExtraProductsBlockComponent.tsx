"use client";

import React from "react";
import { BlockProposal, ProposalBlock, ExtraProduct } from "@/types/block-proposal";
import { Plus, Check, Sparkles, Layers } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  onToggleExtraProduct?: (productId: string, included: boolean) => void;
}

export function ExtraProductsBlockComponent({ block, proposal, onToggleExtraProduct }: BlockComponentProps) {
  const { headline, description } = block.data || {};
  const products = proposal.extraProducts || [];

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <Layers className="w-4 h-4" />
          <span>System Enhancements</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          {headline || "Optional Extra Equipment"}
        </h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((prod: ExtraProduct) => {
          const isIncluded = prod.included;

          return (
            <div
              key={prod.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isIncluded
                  ? "bg-emerald-500/5 border-emerald-500/40 dark:border-emerald-500/50 shadow-md"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {prod.image && (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  )}
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      {prod.brand}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{prod.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{prod.description}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Price</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    +£{prod.price.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => onToggleExtraProduct && onToggleExtraProduct(prod.id, !isIncluded)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    isIncluded
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900"
                  }`}
                >
                  {isIncluded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add (+£{prod.price})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
