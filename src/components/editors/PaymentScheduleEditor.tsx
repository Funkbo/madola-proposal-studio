"use client";

import React, { useState } from "react";
import { BlockProposal, ProposalBlock, PaymentMilestone } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";
import { AlertTriangle, Plus, Trash2, CheckCircle2 } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  onUpdateProposal: (updatedProposal: BlockProposal) => void;
}

export function PaymentScheduleEditor({ block, proposal, onUpdateProposal }: BlockEditorProps) {
  const milestones = proposal.paymentSchedule || [];
  const totals = calculateProposalTotals(proposal);

  const totalPercentage = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
  const isValid100Percent = Math.abs(totalPercentage - 100) < 0.01;

  const handleUpdateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateProposal({
      ...proposal,
      paymentSchedule: updated,
    });
  };

  const handleAddMilestone = () => {
    const newMilestone: PaymentMilestone = {
      id: `m-${Date.now()}`,
      label: "New Payment Milestone",
      percentage: 0,
      paymentMethod: "Bank Transfer",
      description: "Milestone description...",
    };
    onUpdateProposal({
      ...proposal,
      paymentSchedule: [...milestones, newMilestone],
    });
  };

  const handleRemoveMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    onUpdateProposal({
      ...proposal,
      paymentSchedule: updated,
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-900 dark:text-slate-100">
          Payment Milestones ({milestones.length})
        </label>
        <button
          type="button"
          onClick={handleAddMilestone}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Milestone
        </button>
      </div>

      {/* Validation Banner for 100% Total */}
      {!isValid100Percent ? (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Validation Warning: Total milestone percentage is <strong>{totalPercentage}%</strong> (Must equal 100%).
          </span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Validation Success: Payment percentages total 100%.</span>
        </div>
      )}

      <div className="space-y-4">
        {milestones.map((m, idx) => {
          const calculatedAmount = (totals.finalTotal * (m.percentage || 0)) / 100;

          return (
            <div
              key={m.id || idx}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={m.label}
                  onChange={(e) => handleUpdateMilestone(idx, "label", e.target.value)}
                  placeholder="Milestone Label"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(idx)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={m.percentage}
                    onChange={(e) => handleUpdateMilestone(idx, "percentage", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={m.paymentMethod}
                    onChange={(e) => handleUpdateMilestone(idx, "paymentMethod", e.target.value)}
                    placeholder="Bank Transfer"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Calculated Amount from £{totals.finalTotal.toLocaleString()}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  £{calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <textarea
                rows={2}
                value={m.description}
                onChange={(e) => handleUpdateMilestone(idx, "description", e.target.value)}
                placeholder="Milestone Terms / Description"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
