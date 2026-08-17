"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { MediaPicker } from "@/components/media/MediaPicker";
import { Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  onSaveData: (data: any) => void;
}

export function OurWorkEditor({ block, onSaveData }: BlockEditorProps) {
  const [formData, setFormData] = useState({
    title: block.data?.title || "Recent UK Installations",
    description: block.data?.description || "",
    mainImage: block.data?.mainImage || {
      url: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1000&q=80",
      caption: "5.4 kW In-Roof All-Black Solar Array — Surrey, UK",
    },
    supportingImages: block.data?.supportingImages || [],
  });

  const [activeMediaTarget, setActiveMediaTarget] = useState<"main" | number | null>(null);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    const imageUrls = [
      updated.mainImage?.url,
      ...(Array.isArray(updated.supportingImages) ? updated.supportingImages.map((s: any) => s.url || s) : []),
    ].filter(Boolean);
    const finalData = { ...updated, images: imageUrls };
    setFormData(updated);
    onSaveData(finalData);
  };

  const handleUpdateCaption = (target: "main" | number, caption: string) => {
    if (target === "main") {
      handleChange("mainImage", { ...formData.mainImage, caption });
    } else {
      const updated = [...formData.supportingImages];
      updated[target] = { ...updated[target], caption };
      handleChange("supportingImages", updated);
    }
  };

  const handleSelectMedia = (url: string) => {
    if (activeMediaTarget === "main") {
      handleChange("mainImage", { ...formData.mainImage, url });
    } else if (typeof activeMediaTarget === "number") {
      const updated = [...formData.supportingImages];
      if (activeMediaTarget < updated.length) {
        updated[activeMediaTarget] = { ...updated[activeMediaTarget], url };
      } else {
        updated.push({ url, caption: "New installation photo caption" });
      }
      handleChange("supportingImages", updated);
    }
    setActiveMediaTarget(null);
  };

  const handleAddImage = () => {
    const newImage = {
      url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80",
      caption: "New installation caption",
    };
    const updated = [...formData.supportingImages, newImage];
    handleChange("supportingImages", updated);
  };

  const handleRemoveSupportingImage = (index: number) => {
    const updated = formData.supportingImages.filter((_: any, i: number) => i !== index);
    handleChange("supportingImages", updated);
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const updated = [...formData.supportingImages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[targetIndex];
    updated[targetIndex] = updated[index];
    updated[index] = temp;
    handleChange("supportingImages", updated);
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Gallery Section Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Gallery Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Main Image Management */}
      <div className="space-y-2">
        <label className="block font-bold text-slate-900 dark:text-slate-100">
          Main Hero Showcase Photo
        </label>
        <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
          {formData.mainImage?.url && (
            <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700">
              <img src={formData.mainImage.url} alt="Main Showcase" className="w-full h-full object-cover" />
            </div>
          )}
          <input
            type="text"
            value={formData.mainImage?.caption || ""}
            onChange={(e) => handleUpdateCaption("main", e.target.value)}
            placeholder="Main photo caption..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
          />
          <button
            type="button"
            onClick={() => setActiveMediaTarget("main")}
            className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Replace Main Photo
          </button>
        </div>
      </div>

      {/* Supporting Images Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900 dark:text-slate-100">
            Supporting Project Photos ({formData.supportingImages.length})
          </label>
          <button
            type="button"
            onClick={handleAddImage}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Gallery Image
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {formData.supportingImages.map((img: any, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3"
            >
              <img src={img.url} alt={`Gallery ${idx}`} className="w-16 h-12 rounded-lg object-cover border shrink-0" />
              <div className="flex-1 space-y-1 min-w-0">
                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => handleUpdateCaption(idx, e.target.value)}
                  placeholder="Photo caption..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-xs"
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveImage(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveImage(idx, "down")}
                  disabled={idx === formData.supportingImages.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTarget(idx)}
                  className="p-1.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSupportingImage(idx)}
                  className="p-1.5 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MediaPicker
        isOpen={activeMediaTarget !== null}
        onClose={() => setActiveMediaTarget(null)}
        onSelectImage={handleSelectMedia}
        title="Select Gallery Photo"
      />
    </div>
  );
}
