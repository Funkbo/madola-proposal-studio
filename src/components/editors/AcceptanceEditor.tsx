"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";

export interface BlockEditorProps {
  block: ProposalBlock;
  onSaveData: (data: any) => void;
}

export function AcceptanceEditor({ block, onSaveData }: BlockEditorProps) {
  const [formData, setFormData] = useState({
    headline: block.data?.headline || "Ready to Accept Your Proposal?",
    termsNotice: block.data?.termsNotice || "By accepting this proposal, you agree to reserve your installation slot.",
  });

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveData(updated);
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Acceptance Section Headline
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
          Terms & Confirmation Copy
        </label>
        <textarea
          rows={3}
          value={formData.termsNotice}
          onChange={(e) => handleChange("termsNotice", e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
}
