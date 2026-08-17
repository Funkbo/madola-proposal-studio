"use client";

import React, { useState } from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { MediaPicker } from "@/components/media/MediaPicker";
import { Image as ImageIcon } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  onUpdateProposal: (updatedProposal: BlockProposal) => void;
}

export function EvChargerEditor({ block, proposal, onUpdateProposal }: BlockEditorProps) {
  const evCharger = proposal.evCharger || {
    id: "ev-default",
    name: "myenergi zappi 7kW Smart EV Charger",
    brand: "myenergi",
    description: "Eco-smart EV charger using 100% surplus solar energy.",
    price: 950,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
    included: false,
    selected: false,
    isOptional: true,
  };

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const handleUpdateEvField = (field: string, value: any) => {
    const updatedEv = { ...evCharger, [field]: value };
    onUpdateProposal({
      ...proposal,
      evCharger: updatedEv,
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Smart EV Charger Details & Pricing
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Brand
            </label>
            <input
              type="text"
              value={evCharger.brand}
              onChange={(e) => handleUpdateEvField("brand", e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Add-On Price (£)
            </label>
            <input
              type="number"
              step="25"
              value={evCharger.price}
              onChange={(e) => handleUpdateEvField("price", parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Product Name
          </label>
          <input
            type="text"
            value={evCharger.name}
            onChange={(e) => handleUpdateEvField("name", e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Product Description
          </label>
          <textarea
            rows={3}
            value={evCharger.description}
            onChange={(e) => handleUpdateEvField("description", e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            EV Charger Image
          </label>
          <div className="flex items-center gap-3">
            {evCharger.image && (
              <img src={evCharger.image} alt={evCharger.name} className="w-16 h-12 rounded-lg object-cover border" />
            )}
            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Replace EV Image
            </button>
          </div>
        </div>
      </div>

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectImage={(src) => handleUpdateEvField("image", src)}
        title="Select EV Charger Product Image"
      />
    </div>
  );
}
