"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap } from "lucide-react";

export interface PanelLayoutBlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  isAdmin?: boolean;
}

export function PanelLayoutBlockComponent({ block, proposal }: PanelLayoutBlockComponentProps) {
  const branding = useCompanyBranding();
  const [logoError, setLogoError] = React.useState(false);

  const panelCount = proposal.panelCount || 12;
  const systemSizeKw = proposal.systemSizeKw || "5.4";
  const annualGenerationKwh = Math.round(parseFloat(systemSizeKw) * 912) || 4927;

  const DEFAULT_LAYOUT_IMAGE = "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80";
  const initialImage = proposal.layoutImage || block.data?.layoutImage;

  const [imgSrc, setImgSrc] = React.useState<string>(
    typeof initialImage === "string" && initialImage.length > 50 ? initialImage : DEFAULT_LAYOUT_IMAGE
  );

  React.useEffect(() => {
    if (typeof initialImage === "string" && initialImage.length > 50) {
      setImgSrc(initialImage);
    }
  }, [initialImage]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. TOP HEADER ROW: Solid Green Rounded Pill on LEFT, Madola Logo on RIGHT */}
      <div className="flex items-center justify-between">
        <div className="bg-emerald-500 text-white font-extrabold text-xs px-5 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
          Panel layout
        </div>

        <div className="flex items-center gap-2">
          {!logoError && branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              onError={() => setLogoError(true)}
              className="h-9 max-w-[180px] w-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
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
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
          Solar panel layout & system output
        </h2>
      </div>

      {/* 3. DYNAMIC DESCRIPTION COPY */}
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        This system includes <strong className="text-slate-900 dark:text-white font-bold">{panelCount} LONGi solar panels</strong> installed on a single roof. It's powered by a <strong className="text-slate-900 dark:text-white font-bold">Hanchu ESS inverter</strong> and backed up by a <strong className="text-slate-900 dark:text-white font-bold">Hanchu ESS battery</strong> for reliable energy storage.
      </p>

      {/* 4. ROOF IMAGE / AERIAL SOLAR PANEL LAYOUT */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/10] border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 group">
        <img
          src={imgSrc}
          alt="Solar Panel Roof Layout"
          onError={() => setImgSrc(DEFAULT_LAYOUT_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>

      {/* 5. PRODUCTION YIELD OUTPUT BANNER */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Using MCS certified calculations we estimate that your panels will produce:
        </p>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          {annualGenerationKwh.toLocaleString()} kWh per year
        </p>
      </div>
    </div>
  );
}
