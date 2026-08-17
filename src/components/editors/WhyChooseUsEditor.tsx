"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { MediaPicker } from "@/components/media/MediaPicker";
import { DEFAULT_ACCREDITATION_LOGOS } from "@/lib/media-library";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Award } from "lucide-react";

export interface BlockEditorProps {
  block: ProposalBlock;
  onSaveData: (data: any) => void;
}

export function WhyChooseUsEditor({ block, onSaveData }: BlockEditorProps) {
  const [heading, setHeading] = useState(block.data?.heading || "Why Choose Madola?");
  const [paragraph1, setParagraph1] = useState(
    block.data?.paragraph1 ||
      "Madola Energy is a leading provider of solar power solutions for businesses and homes across the UK. Since our founding in 2013, we’ve been dedicated to providing high-quality, reliable, and sustainable solar power installations that help our customers save money, reduce their carbon footprint, and make a positive impact on the environment."
  );
  const [paragraph2, setParagraph2] = useState(
    block.data?.paragraph2 ||
      "We are committed to staying at the forefront of new and innovative technologies in the solar power industry, and to deliver tailored solutions that meet the unique needs of each customer."
  );
  const [madolaWayHeading, setMadolaWayHeading] = useState(block.data?.madolaWayHeading || "The Madola way");
  const [benefits, setBenefits] = useState<any[]>(
    block.data?.benefits || [
      {
        title: "Certified and accredited",
        desc: "by leading industry organisations, ensuring the highest standards of quality and performance.",
      },
      {
        title: "Free consultation and support",
        desc: "from our team of experts to help you make informed decisions and choose the best solar power solutions for your needs.",
      },
    ]
  );
  const [closingLine, setClosingLine] = useState(block.data?.closingLine || "Go Solar, with Madola!");
  const [accreditations, setAccreditations] = useState<any[]>(
    block.data?.accreditations || DEFAULT_ACCREDITATION_LOGOS
  );

  const [activeReplaceIndex, setActiveReplaceIndex] = useState<number | null>(null);

  const emitSave = (updated: any) => {
    onSaveData({
      ...block.data,
      ...updated,
    });
  };

  const handleUpdateHeading = (val: string) => {
    setHeading(val);
    emitSave({ heading: val, paragraph1, paragraph2, madolaWayHeading, benefits, closingLine, accreditations });
  };

  const handleUpdatePara1 = (val: string) => {
    setParagraph1(val);
    emitSave({ heading, paragraph1: val, paragraph2, madolaWayHeading, benefits, closingLine, accreditations });
  };

  const handleUpdatePara2 = (val: string) => {
    setParagraph2(val);
    emitSave({ heading, paragraph1, paragraph2: val, madolaWayHeading, benefits, closingLine, accreditations });
  };

  const handleUpdateMadolaWay = (val: string) => {
    setMadolaWayHeading(val);
    emitSave({ heading, paragraph1, paragraph2, madolaWayHeading: val, benefits, closingLine, accreditations });
  };

  const handleUpdateBenefit = (index: number, field: string, val: string) => {
    const updated = [...benefits];
    updated[index] = { ...updated[index], [field]: val };
    setBenefits(updated);
    emitSave({ heading, paragraph1, paragraph2, madolaWayHeading, benefits: updated, closingLine, accreditations });
  };

  const handleAddBenefit = () => {
    const updated = [...benefits, { title: "New Benefit", desc: "Benefit details..." }];
    setBenefits(updated);
    emitSave({ heading, paragraph1, paragraph2, madolaWayHeading, benefits: updated, closingLine, accreditations });
  };

  const handleRemoveBenefit = (index: number) => {
    const updated = benefits.filter((_, i) => i !== index);
    setBenefits(updated);
    emitSave({ heading, paragraph1, paragraph2, madolaWayHeading, benefits: updated, closingLine, accreditations });
  };

  const handleUpdateClosingLine = (val: string) => {
    setClosingLine(val);
    emitSave({ heading, paragraph1, paragraph2, madolaWayHeading, benefits, closingLine: val, accreditations });
  };

  // Accreditation Logo Management
  const handleSelectAccreditationImage = (src: string) => {
    if (activeReplaceIndex !== null && activeReplaceIndex >= 0) {
      const updated = [...accreditations];
      updated[activeReplaceIndex] = { ...updated[activeReplaceIndex], src };
      setAccreditations(updated);
      emitSave({ heading, paragraph1, paragraph2, madolaWayHeading, benefits, closingLine, accreditations: updated });
    } else {
      const newAcc = {
        id: `acc-${Date.now()}`,
        name: "Accreditation Logo",
        src,
        alt: "Accreditation Logo",
      };
      const updated = [...accreditations, newAcc];
      setAccreditations(updated);
      emitSave({ heading, paragraph1, paragraph2, madolaWayHeading, benefits, closingLine, accreditations: updated });
    }
    setActiveReplaceIndex(null);
  };

  const handleRemoveAccreditation = (index: number) => {
    const updated = accreditations.filter((_, i) => i !== index);
    setAccreditations(updated);
    emitSave({ heading, paragraph1, paragraph2, madolaWayHeading, benefits, closingLine, accreditations: updated });
  };

  const handleMoveAccreditation = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= accreditations.length) return;
    const updated = [...accreditations];
    const temp = updated[target];
    updated[target] = updated[index];
    updated[index] = temp;
    setAccreditations(updated);
    emitSave({ heading, paragraph1, paragraph2, madolaWayHeading, benefits, closingLine, accreditations: updated });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="space-y-4">
        {/* Main Heading */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Section Main Heading *
          </label>
          <input
            type="text"
            value={heading}
            onChange={(e) => handleUpdateHeading(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Intro Paragraph 1 */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Introduction Paragraph 1
          </label>
          <textarea
            rows={3}
            value={paragraph1}
            onChange={(e) => handleUpdatePara1(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
          />
        </div>

        {/* Intro Paragraph 2 */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Introduction Paragraph 2
          </label>
          <textarea
            rows={3}
            value={paragraph2}
            onChange={(e) => handleUpdatePara2(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
          />
        </div>

        {/* The Madola Way Heading */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            "The Madola Way" Sub-Heading
          </label>
          <input
            type="text"
            value={madolaWayHeading}
            onChange={(e) => handleUpdateMadolaWay(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Benefits List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 dark:text-slate-100">
              Key Benefit Rows ({benefits.length})
            </label>
            <button
              type="button"
              onClick={handleAddBenefit}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Benefit Row
            </button>
          </div>

          <div className="space-y-3">
            {benefits.map((b: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-500 text-slate-950 font-bold flex items-center justify-center font-mono text-[11px] shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => handleUpdateBenefit(idx, "title", e.target.value)}
                    placeholder="Benefit Heading"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={b.desc}
                  onChange={(e) => handleUpdateBenefit(idx, "desc", e.target.value)}
                  placeholder="Benefit Description"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Closing Line */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Closing Line / Callout
          </label>
          <input
            type="text"
            value={closingLine}
            onChange={(e) => handleUpdateClosingLine(e.target.value)}
            placeholder="Go Solar, with Madola!"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Accreditation Logos Management */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Accreditation Logos ({accreditations.length})</span>
            </label>
            <button
              type="button"
              onClick={() => setActiveReplaceIndex(-1)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Logo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accreditations.map((acc: any, idx: number) => (
              <div
                key={acc.id || idx}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={acc.src}
                    alt={acc.name || acc.alt}
                    className="w-10 h-8 object-contain rounded border p-0.5 bg-slate-50 shrink-0"
                  />
                  <span className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">
                    {acc.name || `Logo ${idx + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveReplaceIndex(idx)}
                    className="p-1 text-slate-400 hover:text-emerald-500"
                    title="Replace Logo"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveAccreditation(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveAccreditation(idx, "down")}
                    disabled={idx === accreditations.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAccreditation(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <MediaPicker
        isOpen={activeReplaceIndex !== null}
        onClose={() => setActiveReplaceIndex(null)}
        onSelectImage={handleSelectAccreditationImage}
        title="Select Accreditation Logo Image"
      />
    </div>
  );
}
