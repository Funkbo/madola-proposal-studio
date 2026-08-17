"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { Plus, Trash2 } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  onSaveData: (data: any) => void;
}

export function TextBlockEditor({ block, onSaveData }: BlockEditorProps) {
  const [formData, setFormData] = useState({
    heading: block.data?.heading || "Section Heading",
    bodyText: block.data?.bodyText || "",
    bulletPoints: block.data?.bulletPoints || [],
  });

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveData(updated);
  };

  const handleAddBullet = () => {
    const updated = [...formData.bulletPoints, "New bullet point item"];
    handleChange("bulletPoints", updated);
  };

  const handleUpdateBullet = (index: number, val: string) => {
    const updated = [...formData.bulletPoints];
    updated[index] = val;
    handleChange("bulletPoints", updated);
  };

  const handleRemoveBullet = (index: number) => {
    const updated = formData.bulletPoints.filter((_: any, i: number) => i !== index);
    handleChange("bulletPoints", updated);
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Heading
        </label>
        <input
          type="text"
          value={formData.heading}
          onChange={(e) => handleChange("heading", e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Paragraph Text Body
        </label>
        <textarea
          rows={4}
          value={formData.bodyText}
          onChange={(e) => handleChange("bodyText", e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Bullet Points */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900 dark:text-slate-100">
            Bullet Points ({formData.bulletPoints.length})
          </label>
          <button
            type="button"
            onClick={handleAddBullet}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Bullet
          </button>
        </div>

        {formData.bulletPoints.map((bullet: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={bullet}
              onChange={(e) => handleUpdateBullet(idx, e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
            <button
              type="button"
              onClick={() => handleRemoveBullet(idx)}
              className="p-2 text-rose-500 hover:text-rose-700 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
