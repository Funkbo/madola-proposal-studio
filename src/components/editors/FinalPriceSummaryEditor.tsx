"use client";

import React, { useState } from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";
import { Receipt, Info } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  onSaveData: (data: any) => void;
}

export function FinalPriceSummaryEditor({ block, proposal, onSaveData }: BlockEditorProps) {
  const [formData, setFormData] = useState({
    headline: block.data?.headline || "Turnkey Investment Summary",
    notes: block.data?.notes || "All pricing includes full installation, scaffolding, MCS certification, and 0% UK VAT rate.",
  });

  const totals = calculateProposalTotals(proposal);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveData(updated);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span>
          Note: Final proposal totals cannot be manually typed. They are automatically calculated from your Base System (£{totals.basePrice}), Extra Add-ons (+£{totals.extraProductsPrice}), EV Charger (+£{totals.evChargerPrice}), and 0% VAT.
        </span>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Summary Headline
        </label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => handleChange("headline", e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Notes / VAT Disclaimer Copy
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
}
