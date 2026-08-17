"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { CoverBlockEditor } from "./CoverBlockEditor";
import { WhyChooseUsEditor } from "./WhyChooseUsEditor";
import { TextBlockEditor } from "./TextBlockEditor";
import { OurWorkEditor } from "./OurWorkEditor";
import { WhatsIncludedEditor } from "./WhatsIncludedEditor";
import { EvChargerEditor } from "./EvChargerEditor";
import { ExtraProductsEditor } from "./ExtraProductsEditor";
import { NextStepsEditor } from "./NextStepsEditor";
import { PaymentScheduleEditor } from "./PaymentScheduleEditor";
import { FinalPriceSummaryEditor } from "./FinalPriceSummaryEditor";
import { AcceptanceEditor } from "./AcceptanceEditor";
import { Sliders, X, Check } from "lucide-react";

export interface BlockSettingsModalProps {
  block: ProposalBlock | null;
  proposal: BlockProposal;
  isOpen: boolean;
  onClose: () => void;
  onSaveBlockData: (blockId: string, data: any) => void;
  onUpdateProposal: (proposal: BlockProposal) => void;
}

export function BlockSettingsModal({
  block,
  proposal,
  isOpen,
  onClose,
  onSaveBlockData,
  onUpdateProposal,
}: BlockSettingsModalProps) {
  if (!isOpen || !block) return null;

  const handleSaveData = (data: any) => {
    onSaveBlockData(block.id, data);
  };

  const renderEditor = () => {
    switch (block.type) {
      case "cover":
        return <CoverBlockEditor block={block} onSaveData={handleSaveData} />;
      case "why_choose_us":
        return <WhyChooseUsEditor block={block} onSaveData={handleSaveData} />;
      case "text":
        return <TextBlockEditor block={block} onSaveData={handleSaveData} />;
      case "our_work":
        return <OurWorkEditor block={block} onSaveData={handleSaveData} />;
      case "whats_included":
        return <WhatsIncludedEditor block={block} onSaveData={handleSaveData} />;
      case "ev_charger":
        return (
          <EvChargerEditor
            block={block}
            proposal={proposal}
            onUpdateProposal={onUpdateProposal}
          />
        );
      case "extra_products":
        return (
          <ExtraProductsEditor
            block={block}
            proposal={proposal}
            onUpdateProposal={onUpdateProposal}
          />
        );
      case "next_steps":
        return <NextStepsEditor block={block} onSaveData={handleSaveData} />;
      case "payment_schedule":
        return (
          <PaymentScheduleEditor
            block={block}
            proposal={proposal}
            onUpdateProposal={onUpdateProposal}
          />
        );
      case "final_price_summary":
        return <FinalPriceSummaryEditor block={block} proposal={proposal} onSaveData={handleSaveData} />;
      case "acceptance":
        return <AcceptanceEditor block={block} onSaveData={handleSaveData} />;
      default:
        return (
          <div className="p-4 text-xs text-slate-500">
            No custom editor configured for block type: {block.type}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                Block Settings Panel
              </span>
              <h3 className="font-bold text-lg text-white">Editing Block: "{block.title}"</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">{renderEditor()}</div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 rounded-b-3xl">
          <span className="text-xs text-slate-400 font-mono">Changes update document in real-time</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Done Editing</span>
          </button>
        </div>

      </div>
    </div>
  );
}
