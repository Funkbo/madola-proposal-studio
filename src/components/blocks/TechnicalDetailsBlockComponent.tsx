"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function TechnicalDetailsBlockComponent({ block, proposal }: BlockComponentProps) {
  const branding = useCompanyBranding();
  const [logoError, setLogoError] = React.useState(false);

  const {
    heading = "Technical details",
    roofGroup = "Roof 1",
    orientation = "59° from south",
    pitch = "37°",
    panelGroupLabel = "Panel group 1",
    kwhPerKwp = 856,
    introText = "As an MCS certified installer, we follow their strict calculation guidelines. Here's how we calculated your annual output estimate. If you need to speak to us about this we can run you through more of the detail.",
    disclaimerText = "The shade mask mapped onto the sunpath diagram is based off the field of view from a point in the center of the array. This means that the shade mask shown will only capture the shading experienced at the array center point, and will not reflect the shading casted onto other locations on the array.",
  } = block.data || {};

  const systemSizeKw = parseFloat(proposal.systemSizeKw || "5.4");
  const annualGenerationKwh = Math.round(systemSizeKw * 912);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. TOP HEADER ROW */}
      <div className="flex items-center justify-between -mx-8 sm:-mx-12 -mt-4 mb-2">
        <div
          className="text-white font-bold text-xs px-5 py-2 rounded-r-full shadow-sm tracking-wider uppercase"
          style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
        >
          Technical details
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

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{introText}</p>

      {/* 3. ROOF TAB CARD */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
        <div className="bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{roofGroup}</span>
          <span className="text-xs text-slate-500 font-medium">
            {orientation} • {pitch} pitch
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 space-y-2">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{panelGroupLabel}</h4>
            <p className="text-xs text-slate-500 font-mono">
              kWh/kWp (Kk): <strong className="text-slate-800 dark:text-slate-200">{kwhPerKwp}</strong>
            </p>
          </div>

          <div className="md:col-span-8 space-y-2">
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Sunpath Diagram</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              <strong className="text-rose-600">Disclaimer:</strong> {disclaimerText}
            </p>

            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-end">
              <svg viewBox="0 0 400 160" className="w-full h-full">
                <line x1="20" y1="140" x2="380" y2="140" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="100" x2="380" y2="100" stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
                <line x1="20" y1="60" x2="380" y2="60" stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
                <line x1="20" y1="20" x2="380" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />

                <path d="M 40 140 Q 200 10 360 140 Z" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="2" />
                <path d="M 80 140 Q 200 40 320 140 Z" fill="rgba(16, 185, 129, 0.4)" stroke="#059669" strokeWidth="1.5" />

                <rect x="340" y="105" width="12" height="35" fill="#cbd5e1" />
                <rect x="352" y="95" width="12" height="45" fill="#94a3b8" />
                <rect x="364" y="85" width="12" height="55" fill="#64748b" />

                <text x="40" y="155" fontSize="9" fill="#94a3b8" textAnchor="middle">135° East</text>
                <text x="120" y="155" fontSize="9" fill="#94a3b8" textAnchor="middle">90° East</text>
                <text x="200" y="155" fontSize="9" fill="#10b981" fontWeight="bold" textAnchor="middle">0° South</text>
                <text x="280" y="155" fontSize="9" fill="#94a3b8" textAnchor="middle">90° West</text>
                <text x="360" y="155" fontSize="9" fill="#94a3b8" textAnchor="middle">135° West</text>
              </svg>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Other information used in the calculations: Installation capacity:{" "}
            <strong className="text-slate-900 dark:text-slate-100">{systemSizeKw} kWp</strong>
          </span>
          <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 font-mono">
            Estimated output (kWp x Kk x SF): {annualGenerationKwh.toLocaleString()} kWh
          </span>
        </div>
      </div>
    </div>
  );
}
