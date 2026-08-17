"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  onSaveData: (data: any) => void;
}

export function NextStepsEditor({ block, onSaveData }: BlockEditorProps) {
  const steps: any[] = block.data?.steps || [];

  const handleUpdateStep = (index: number, field: string, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    onSaveData({ ...block.data, steps: updated });
  };

  const handleAddStep = () => {
    const newStep = {
      stepNum: steps.length + 1,
      title: "New Installation Step",
      desc: "Step description...",
    };
    const updated = [...steps, newStep];
    updated.forEach((s: any, i: number) => (s.stepNum = i + 1));
    onSaveData({ ...block.data, steps: updated });
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps.filter((_: any, i: number) => i !== index);
    updated.forEach((s: any, i: number) => (s.stepNum = i + 1));
    onSaveData({ ...block.data, steps: updated });
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const updated = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[targetIndex];
    updated[targetIndex] = updated[index];
    updated[index] = temp;
    updated.forEach((s: any, i: number) => (s.stepNum = i + 1));
    onSaveData({ ...block.data, steps: updated });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-900 dark:text-slate-100">
          Customer Journey Steps ({steps.length})
        </label>
        <button
          type="button"
          onClick={handleAddStep}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Step
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((st: any, idx: number) => (
          <div
            key={idx}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center font-mono text-xs shrink-0">
                {st.stepNum || idx + 1}
              </span>
              <input
                type="text"
                value={st.title}
                onChange={(e) => handleUpdateStep(idx, "title", e.target.value)}
                placeholder="Step Title"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveStep(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveStep(idx, "down")}
                  disabled={idx === steps.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="p-1 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              value={st.desc}
              onChange={(e) => handleUpdateStep(idx, "desc", e.target.value)}
              placeholder="Step Description"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
