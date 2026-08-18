"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";
import { Check, X } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function PricingBlockComponent({ block, proposal }: BlockComponentProps) {
  const {
    heading = "Your System & Pricing",
    subheading = "A transparent breakdown of your turnkey solar & storage investment.",
  } = block.data || {};

  const totals = calculateProposalTotals(proposal);
  const includedExtraProducts = (proposal.extraProducts || []).filter((p) => p.included);
  const evChargerIncluded = proposal.evCharger && proposal.evCharger.included;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
        <p className="text-xs text-slate-500 mt-1">{subheading}</p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        <div className="py-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {proposal.panelCount} x {proposal.panelWattage}W Solar Panels
            </h3>
            <p className="text-xs text-slate-500">
              {proposal.systemSizeKw} kWp high-efficiency monocrystalline array
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              Included
            </span>
          </div>
        </div>

        <div className="py-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {proposal.batteryCapacity} kWh Battery Storage
            </h3>
            <p className="text-xs text-slate-500">Lithium Iron Phosphate storage</p>
          </div>
          <div className="text-right shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              Included
            </span>
          </div>
        </div>

        <div className="py-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {proposal.inverterRating} kW Hybrid Inverter
            </h3>
            <p className="text-xs text-slate-500">Dual-MPPT with Wi-Fi monitoring</p>
          </div>
          <div className="text-right shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              Included
            </span>
          </div>
        </div>

        {includedExtraProducts.map((p) => (
          <div key={p.id} className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{p.name}</h3>
                <p className="text-xs text-slate-500">{p.description}</p>
              </div>
            </div>
            <div className="text-right shrink-0 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              +£{p.price.toLocaleString()}
            </div>
          </div>
        ))}

        {evChargerIncluded && proposal.evCharger && (
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{proposal.evCharger.name}</h3>
                <p className="text-xs text-slate-500">{proposal.evCharger.description}</p>
              </div>
            </div>
            <div className="text-right shrink-0 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              +£{proposal.evCharger.price.toLocaleString()}
            </div>
          </div>
        )}

        <div className="py-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Full Installation & Certification</h3>
            <p className="text-xs text-slate-500">Scaffolding, MCS certification, DNO approval & 0% VAT</p>
          </div>
          <div className="text-right shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              Included
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold">Turnkey Fixed Price</p>
          <p className="text-xs text-emerald-400 font-mono mt-0.5">0% UK VAT Applied</p>
        </div>
        <p className="text-3xl sm:text-4xl font-black text-white font-mono">
          £{totals.finalTotal.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
