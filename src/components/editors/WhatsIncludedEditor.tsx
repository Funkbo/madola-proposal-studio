"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { MediaPicker } from "@/components/media/MediaPicker";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  onSaveData: (data: any) => void;
}

export function WhatsIncludedEditor({ block, onSaveData }: BlockEditorProps) {
  const [items, setItems] = useState<any[]>(block.data?.items || []);
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
    onSaveData({ ...block.data, items: updated });
  };

  const handleAddItem = () => {
    const newItem = {
      name: "New System Component",
      brand: "Brand Name",
      spec: "Key specification details",
      desc: "Detailed component description...",
      status: "included",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=400&q=80",
    };
    const updated = [...items, newItem];
    setItems(updated);
    onSaveData({ ...block.data, items: updated });
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onSaveData({ ...block.data, items: updated });
  };

  const handleSelectMedia = (src: string) => {
    if (editingMediaIndex !== null) {
      handleUpdateItem(editingMediaIndex, "image", src);
      setEditingMediaIndex(null);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-900 dark:text-slate-100">
          Package Equipment Items ({items.length})
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Component
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-3 flex-1">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                )}
                <div className="space-y-1 flex-1">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(idx, "name", e.target.value)}
                    placeholder="Component Name"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.brand}
                      onChange={(e) => handleUpdateItem(idx, "brand", e.target.value)}
                      placeholder="Brand"
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={item.spec}
                      onChange={(e) => handleUpdateItem(idx, "spec", e.target.value)}
                      placeholder="Spec Summary"
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs"
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
                  onClick={() => handleRemoveItem(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={item.desc}
              onChange={(e) => handleUpdateItem(idx, "desc", e.target.value)}
              placeholder="Component Description"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>
        ))}
      </div>

      <MediaPicker
        isOpen={editingMediaIndex !== null}
        onClose={() => setEditingMediaIndex(null)}
        onSelectImage={handleSelectMedia}
        title="Select Component Product Image"
      />
    </div>
  );
}
