"use client";

import React, { useState } from "react";
import { BlockProposal, ProposalBlock, ExtraProduct } from "@/types/block-proposal";
import { MediaPicker } from "@/components/media/MediaPicker";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  onUpdateProposal: (updatedProposal: BlockProposal) => void;
}

export function ExtraProductsEditor({ block, proposal, onUpdateProposal }: BlockEditorProps) {
  const extraProducts = proposal.extraProducts || [];
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);

  const handleUpdateProduct = (index: number, field: string, value: any) => {
    const updated = [...extraProducts];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateProposal({
      ...proposal,
      extraProducts: updated,
    });
  };

  const handleAddProduct = () => {
    const newProd: ExtraProduct = {
      id: `ext-custom-${Date.now()}`,
      name: "New Optional Accessory",
      brand: "Brand",
      description: "Accessory description...",
      price: 250,
      image: "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=400&q=80",
      included: false,
      isOptional: true,
    };
    onUpdateProposal({
      ...proposal,
      extraProducts: [...extraProducts, newProd],
    });
  };

  const handleRemoveProduct = (index: number) => {
    const updated = extraProducts.filter((_, i) => i !== index);
    onUpdateProposal({
      ...proposal,
      extraProducts: updated,
    });
  };

  const handleSelectMedia = (src: string) => {
    if (editingMediaIndex !== null) {
      handleUpdateProduct(editingMediaIndex, "image", src);
      setEditingMediaIndex(null);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-900 dark:text-slate-100">
          Optional Extra Equipment & Add-ons ({extraProducts.length})
        </label>
        <button
          type="button"
          onClick={handleAddProduct}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Equipment
        </button>
      </div>

      <div className="space-y-4">
        {extraProducts.map((prod, idx) => (
          <div
            key={prod.id || idx}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                {prod.image && (
                  <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                )}
                <div className="space-y-1 flex-1">
                  <input
                    type="text"
                    value={prod.name}
                    onChange={(e) => handleUpdateProduct(idx, "name", e.target.value)}
                    placeholder="Product Name"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={prod.brand}
                      onChange={(e) => handleUpdateProduct(idx, "brand", e.target.value)}
                      placeholder="Brand"
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-mono"
                    />
                    <input
                      type="number"
                      step="25"
                      value={prod.price}
                      onChange={(e) => handleUpdateProduct(idx, "price", parseInt(e.target.value) || 0)}
                      placeholder="Price (£)"
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingMediaIndex(idx)}
                  className="p-2 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={prod.description}
              onChange={(e) => handleUpdateProduct(idx, "description", e.target.value)}
              placeholder="Product Description"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>
        ))}
      </div>

      <MediaPicker
        isOpen={editingMediaIndex !== null}
        onClose={() => setEditingMediaIndex(null)}
        onSelectImage={handleSelectMedia}
        title="Select Extra Product Image"
      />
    </div>
  );
}
