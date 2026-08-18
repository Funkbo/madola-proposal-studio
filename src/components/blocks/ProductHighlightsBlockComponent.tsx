"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function ProductHighlightsBlockComponent({ block, proposal }: BlockComponentProps) {
  const branding = useCompanyBranding();
  const [logoError, setLogoError] = React.useState(false);

  const {
    heading = "Product highlights",
    introText = "The system features premium tier-1 hardware engineered for UK weather conditions.",
    batteryTitle = `${proposal.batteryCapacity} kWh LFP Battery Storage`,
    batterySubtitle = "Cobalt-free lithium iron phosphate chemistry • 6,000+ cycle warranty",
    batteryImage = "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=600&q=80",
    inverterTitle = `${proposal.inverterRating} kW Hybrid Inverter`,
    inverterSubtitle = "Dual-MPPT smart hybrid inverter • EPS emergency backup • Wi-Fi app",
    inverterImage = "https://images.unsplash.com/photo-1558441719-8b449c6ff8ff?auto=format&fit=crop&w=600&q=80",
    panelTitle = `${proposal.panelCount} x ${proposal.panelWattage}W Monocrystalline PV Panels`,
    panelSubtitle = "Ultra-high efficiency all-black modules for optimal UK performance",
    panelImage = "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80",
  } = block.data || {};

  const items = [
    {
      key: "battery",
      title: batteryTitle,
      subtitle: batterySubtitle,
      image: batteryImage,
    },
    {
      key: "inverter",
      title: inverterTitle,
      subtitle: inverterSubtitle,
      image: inverterImage,
    },
    {
      key: "panels",
      title: panelTitle,
      subtitle: panelSubtitle,
      image: panelImage,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. TOP HEADER ROW */}
      <div className="flex items-center justify-between -mx-8 sm:-mx-12 -mt-4 mb-2">
        <div
          className="text-white font-bold text-xs px-5 py-2 rounded-r-full shadow-sm tracking-wider uppercase"
          style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
        >
          Product Highlights
        </div>

        <div className="flex items-center gap-2 pr-8 sm:pr-12">
          {!logoError && branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              onError={() => setLogoError(true)}
              className="h-8 max-w-[160px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-slate-50 uppercase">
                {branding.companyName || "MADOLA ENERGY"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN TITLE */}
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      {introText && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{introText}</p>
      )}

      {/* 3. HARDWARE CARDS */}
      <div className="space-y-4 pt-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 dark:border-emerald-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-emerald-500/50 transition-all"
          >
            <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 p-2 flex items-center justify-center shadow-inner">
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
