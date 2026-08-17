"use client";

import React, { useState } from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap, X, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface WhatsIncludedBlockComponentProps {
  block: ProposalBlock;
  proposal?: BlockProposal;
  isAdmin?: boolean;
}

const DEFAULT_WHATS_INCLUDED = [
  {
    id: "inc-bird",
    title: "Bird Protection",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80",
    description:
      "As standard, we protect your solar investment and your roof by adding Bird Protection to your solar system, at no extra cost. Nesting birds can cause serious damage to panels, wiring, and roofing over time leading to costly repairs and reduced system efficiency. Our discreet and durable bird-proofing solutions keep pests away and keep your installation working at peak performance.",
    details:
      "High-grade stainless steel & UV-stabilized polycarbonate mesh installed around the full array perimeter to prevent pigeons, seagulls, and nesting birds from damaging cables or roof tiles without voiding panel warranties.",
  },
  {
    id: "inc-scaffold",
    title: "Scaffolding",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    description:
      "Scaffolding is often required for a solar installation to provide safe and stable access to the roof for installers working at height. It helps protect both the workers and the property by reducing the risk of falls, allowing equipment and panels to be moved securely, and ensuring the installation can be completed efficiently and in full compliance with HSE safety regulations.",
    details:
      "Erected by TG20:21 compliant certified scaffolders 24-48 hours before installation, fully inspected with handrails and toe-boards, and promptly dismantled following commissioning.",
  },
  {
    id: "inc-cert",
    title: "All Necessary Certification",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    description:
      "All necessary MCS certification, Consumer Code documentation, and DNO notification or approval paperwork are included as part of a solar installation. This ensures the system is installed to recognised industry standards, fully compliant with current regulations, and supported with the correct documentation required for insurance, building control, and Smart Export Guarantee (SEG) export payments.",
    details:
      "Complete handover pack including MCS 001/012 Certificate, G98/G99 DNO Grid Approval, NAPIT Part-P Electrical Compliance, HIES Insurance-Backed Guarantee, and 25-Year Manufacturer Warranty documents.",
  },
];

export function WhatsIncludedBlockComponent({ block }: WhatsIncludedBlockComponentProps) {
  const branding = useCompanyBranding();
  const { pillBadge = "What's Included", items } = block.data || {};
  const [modalItem, setModalItem] = useState<any | null>(null);

  const displayItems = Array.isArray(items) && items.length > 0 ? items : DEFAULT_WHATS_INCLUDED;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      
      {/* 1. TOP HEADER ROW: Green Rounded Label on LEFT, Madola Logo on RIGHT */}
      <div className="flex items-center justify-between -mx-8 sm:-mx-12 -mt-4 mb-2">
        <div
          className="text-white font-bold text-xs px-5 py-2 rounded-r-full shadow-sm tracking-wider uppercase"
          style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
        >
          {pillBadge || "What's Included"}
        </div>

        <div className="flex items-center gap-2 pr-8 sm:pr-12">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.companyName} className="h-8 max-w-[160px] object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-slate-50 uppercase">
                {branding.companyName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. THREE FEATURE CARDS */}
      <div className="space-y-4 pt-2">
        {displayItems.map((item: any, idx: number) => (
          <div
            key={item.id || idx}
            className="p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 dark:border-emerald-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-emerald-500/50 transition-all"
          >
            {/* Image Box */}
            <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-inner">
              <img
                src={item.image}
                alt={item.title || item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Details */}
            <div className="flex-1 space-y-2 min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {item.title || item.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {item.description || item.desc}
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalItem(item)}
                  className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Click for more details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Details */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalItem(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
                {modalItem.title || modalItem.name}
              </h3>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img src={modalItem.image} alt={modalItem.title} className="w-full h-full object-cover" />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {modalItem.description || modalItem.desc}
            </p>

            {modalItem.details && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{modalItem.details}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
