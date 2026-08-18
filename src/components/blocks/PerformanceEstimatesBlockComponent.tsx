"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
}

export function PerformanceEstimatesBlockComponent({ block, proposal }: BlockComponentProps) {
  const branding = useCompanyBranding();
  const [logoError, setLogoError] = React.useState(false);

  const {
    heading = "Performance estimates",
    installedCapacityLabel = "Installed capacity of PV system - kWp (stc)",
    postcodeRegion = proposal.customer?.postcode?.substring(0, 2) || "SW",
    shadeFactor = 0.999,
    kwhPerKwp = 856,
    disclaimer = "Solar PV generation estimates are calculated in accordance with MCS standards (PVGIS / SAP methodology). Actual output varies depending on localized weather, shading changes, and seasonal irradiance.",
  } = block.data || {};

  const systemSizeKw = parseFloat(proposal.systemSizeKw || "5.4");
  const annualGenerationKwh = Math.round(systemSizeKw * kwhPerKwp * shadeFactor);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. TOP HEADER ROW */}
      <div className="flex items-center justify-between -mx-8 sm:-mx-12 -mt-4 mb-2">
        <div
          className="text-white font-bold text-xs px-5 py-2 rounded-r-full shadow-sm tracking-wider uppercase"
          style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
        >
          Performance estimates
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

      {/* 3. MCS CALCULATION TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white font-extrabold">
              <th colSpan={2} className="px-4 py-2.5 uppercase tracking-wider">A. Installation data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <tr>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                {installedCapacityLabel}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                {systemSizeKw} kWp
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                Orientation of the PV system - degrees from South
              </td>
              <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                See in technical details section
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                Inclination of system - degrees from horizontal
              </td>
              <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                See in technical details section
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                Postcode region
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                {postcodeRegion}
              </td>
            </tr>
          </tbody>

          <thead>
            <tr className="bg-slate-800 text-white font-extrabold">
              <th colSpan={2} className="px-4 py-2.5 uppercase tracking-wider">B. Performance calculations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <tr>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                kWh/kWp (Kk) from table
              </td>
              <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                See in technical details section
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                Shade Factor (SF)
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                {shadeFactor}
              </td>
            </tr>
            <tr className="bg-emerald-50/50 dark:bg-emerald-950/30">
              <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                Estimated annual output (kWp x Kk x SF)
              </td>
              <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                {annualGenerationKwh.toLocaleString()} kWh
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. DISCLAIMER */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-100 text-xs space-y-2">
        <p className="font-bold">MCS Standard Performance Disclaimer</p>
        <p className="leading-relaxed">{disclaimer}</p>
      </div>
    </div>
  );
}
