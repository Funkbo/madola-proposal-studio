"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { MediaPicker } from "@/components/media/MediaPicker";
import { Image as ImageIcon, Trash2, User } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  onSaveData: (data: any) => void;
}

export function CoverBlockEditor({ block, onSaveData }: BlockEditorProps) {
  const [formData, setFormData] = useState({
    proposalTitle: block.data?.proposalTitle || "Your Solar & Battery Proposal",
    subtitle: block.data?.subtitle || "High-Efficiency Clean Energy Specification",
    heroImage: block.data?.heroImage || "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    preparedBy: {
      name: block.data?.preparedBy?.name || "Madola Engineering Specialist",
      email: block.data?.preparedBy?.email || "proposals@madola.co.uk",
      profileImage: block.data?.preparedBy?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    greeting: block.data?.greeting || "Hi [Customer Name],",
    introText: block.data?.introText || "Thank you for your enquiry and for considering Madola Energy...",
  });

  const [activeMediaTarget, setActiveMediaTarget] = useState<"hero" | "profile" | null>(null);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveData(updated);
  };

  const handlePreparedByChange = (subField: string, value: string) => {
    const updatedPreparedBy = { ...formData.preparedBy, [subField]: value };
    const updated = { ...formData, preparedBy: updatedPreparedBy };
    setFormData(updated);
    onSaveData(updated);
  };

  const handleSelectMedia = (src: string) => {
    if (activeMediaTarget === "hero") {
      handleChange("heroImage", src);
    } else if (activeMediaTarget === "profile") {
      handlePreparedByChange("profileImage", src);
    }
    setActiveMediaTarget(null);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="space-y-4">
        {/* Proposal Title & Subtitle */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Proposal Document Title *
          </label>
          <input
            type="text"
            value={formData.proposalTitle}
            onChange={(e) => handleChange("proposalTitle", e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Subtitle / Tagline
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Hero Image Management */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Cover Hero Showcase Image
          </label>
          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            {formData.heroImage ? (
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700">
                <img src={formData.heroImage} alt="Hero" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                No hero image set
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveMediaTarget("hero")}
                className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{formData.heroImage ? "Replace Hero Image" : "Choose Hero Image"}</span>
              </button>
              {formData.heroImage && (
                <button
                  type="button"
                  onClick={() => handleChange("heroImage", "")}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Author / Prepared By Section */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
          <label className="block font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-500" />
            <span>Author / Prepared By Details</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={formData.preparedBy.name}
                onChange={(e) => handlePreparedByChange("name", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Author Email
              </label>
              <input
                type="email"
                value={formData.preparedBy.email}
                onChange={(e) => handlePreparedByChange("email", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Author Profile Avatar Image
            </label>
            <div className="flex items-center gap-3">
              <img
                src={formData.preparedBy.profileImage}
                alt="Profile Avatar"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <button
                type="button"
                onClick={() => setActiveMediaTarget("profile")}
                className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Replace Avatar Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* Greeting & Introduction */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Personalised Greeting Line
          </label>
          <input
            type="text"
            value={formData.greeting}
            onChange={(e) => handleChange("greeting", e.target.value)}
            placeholder="Hi [Customer Name],"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Introduction Copy Paragraphs
          </label>
          <textarea
            rows={5}
            value={formData.introText}
            onChange={(e) => handleChange("introText", e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
          />
        </div>
      </div>

      <MediaPicker
        isOpen={activeMediaTarget !== null}
        onClose={() => setActiveMediaTarget(null)}
        onSelectImage={handleSelectMedia}
        title={activeMediaTarget === "hero" ? "Select Cover Hero Showcase Image" : "Select Author Profile Avatar Image"}
      />
    </div>
  );
}
