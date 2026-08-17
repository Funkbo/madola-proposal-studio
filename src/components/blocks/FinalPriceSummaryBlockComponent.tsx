"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";
import { PoundSterling, Check, Sparkles, Receipt } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function FinalPriceSummaryBlockComponent({ block, proposal }: BlockComponentProps) {
  const { headline, notes } = block.data || {};
  const totals = calculateProposalTotals(proposal);

  const includedExtraProducts = (proposal.extraProducts || []).filter((p) => p.included);
  const evChargerIncluded = proposal.evCharger && proposal.evCharger.included;

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          <Receipt className="w-4 h-4" />
          <span>Official Investment Summary</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {headline || "Final Price Summary"}
        </h2>
        {notes && <p className="text-xs text-slate-400">{notes}</p>}
      </div>

      {/* Itemized Calculation Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800/80 text-xs">
        
        {/* Base System */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <span className="font-bold text-white block">
              Base Solar PV & Battery System ({proposal.systemSizeKw} kW Array + {proposal.batteryCapacity} kWh Battery)
            </span>
            <span className="text-slate-400 text-[11px]">
              Includes {proposal.panelCount} × {proposal.panelWattage}W panels, hybrid inverter, scaffolding & MCS installation
            </span>
          </div>
          <span className="font-mono font-bold text-white text-sm">
            £{totals.basePrice.toLocaleString()}
          </span>
        </div>

        {/* Included Extra Products */}
        {includedExtraProducts.map((p) => (
          <div key={p.id} className="p-4 flex justify-between items-center text-slate-300">
            <div>
              <span className="font-semibold block">{p.name}</span>
              <span className="text-[11px] text-slate-400">Optional accessory included</span>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              +£{p.price.toLocaleString()}
            </span>
          </div>
        ))}

        {/* EV Charger */}
        {evChargerIncluded && (
          <div className="p-4 flex justify-between items-center text-slate-300">
            <div>
              <span className="font-semibold block">{proposal.evCharger?.name}</span>
              <span className="text-[11px] text-slate-400">Smart EV charger add-on</span>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              +£{proposal.evCharger?.price.toLocaleString()}
            </span>
          </div>
        )}

        {/* VAT Rate */}
        <div className="p-4 flex justify-between items-center text-slate-400">
          <div>
            <span className="font-medium block">UK Residential VAT (0% Special Incentive Rate)</span>
            <span className="text-[11px] text-slate-500">Government zero-rated energy scheme</span>
          </div>
          <span className="font-mono font-bold text-emerald-400">£0.00 (0% VAT)</span>
        </div>

        {/* Final Total */}
        <div className="p-6 bg-slate-900 flex justify-between items-center text-white">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block">
              Turnkey Final Total Investment
            </span>
            <span className="text-xs text-slate-400">Fixed turnkey price — 0% VAT</span>
          </div>
          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              £{totals.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
