"use client";

import React, { useState } from "react";
import { BlockProposal, ProposalBlock, ExtraProduct } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap, X, ShieldCheck, Check } from "lucide-react";

export interface ExtraProductsBlockComponentProps {
  block: ProposalBlock;
  proposal?: BlockProposal;
  onToggleExtraProduct?: (productId: string, included: boolean) => void;
  isAdmin?: boolean;
}

export interface ExtraProductOption {
  id: string;
  brand: string;
  name: string;
  price: number;
  image: string;
  description: string;
  details: string;
}

const DEFAULT_EXTRA_OPTIONS: ExtraProductOption[] = [
  {
    id: "ext-hanchu-m1",
    brand: "HANCHU ESS",
    name: "Hanchu ESS Gateway M1",
    price: 1750,
    image: "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=600&q=80",
    description:
      "Take control of your home energy system with the Hanchu Gateway M1—a robust, single-phase manual changeover switch designed to seamlessly manage power between the grid, solar, batteries, EV chargers, and backup generators. Ideal for households seeking energy resilience, the M1 allows manual switching.",
    details:
      "Full automatic/manual grid outage isolation, 20ms seamless UPS transfer for critical domestic circuits (lighting, refrigeration, medical, internet), and smart generator interface.",
  },
  {
    id: "ext-sigenergy-gateway",
    brand: "SIGENERGY",
    name: "SigEnergy HomePro Backup Gateway",
    price: 1750,
    image: "https://images.unsplash.com/photo-1558441719-8b449c6ff8ff?auto=format&fit=crop&w=600&q=80",
    description:
      "The HomePro Gateway by Sigen Energy (aka SigEnergy) is an intelligent energy management gateway / switchgear device that integrates solar PV, battery energy storage (ESS), grid supply, and optional generator support. It's designed to give homeowners seamless backup power, clean integration of multiple sources.",
    details:
      "Whole-home microgrid management, sub-5ms uninterruptible power supply (UPS) transfer, built-in intelligent sub-panel load shedding, and integrated revenue-grade meter.",
  },
  {
    id: "ext-fox-eps",
    brand: "FOX ESS",
    name: "Fox EPS Backup Gateway",
    price: 1750,
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80",
    description:
      "The Fox ESS Backup Gateway (model EPS-BOX-SF) is a single-phase whole-home backup solution that automatically isolates your property from the grid during power outages and switches your supply to your solar and battery system.",
    details:
      "Automated contactor isolation compliant with G98/G99 emergency backup regulations, ensuring zero back-feed to the grid while supplying uninterrupted household power.",
  },
  {
    id: "ext-tigo-optimisers",
    brand: "TIGO",
    name: "TS4 Optimiser",
    price: 360,
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80",
    description:
      "The TS4-A-O is an advanced retrofit optimization solution designed to enhance energy efficiency in PV systems. It brings smart module functionality to standard solar panels, supporting up to 500W modules. Key features include module-level optimization for higher energy yield, greater design flexibility, and both panel-level monitoring and rapid shutdown.",
    details:
      "Selective deployment (install only on shaded panels), increases total system yield by up to 25% on complex roof geometries, and includes 25-year manufacturer warranty.",
  },
  {
    id: "ext-workmanship-warranty",
    brand: "MADOLA ENERGY",
    name: "Extended Workmanship Warranty",
    price: 450,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    description:
      "Enjoy added peace of mind with our Extended Workmanship Warranty, providing additional protection for your solar installation beyond the standard cover. It's our commitment to the quality of our workmanship and your long-term confidence in your system.",
    details:
      "Extends on-site labour, roof fixing integrity, electrical cabling, and emergency callout protection to a full 10/25 years, fully backed by HIES insurance.",
  },
];

export function ExtraProductsBlockComponent({
  block,
  proposal,
  onToggleExtraProduct,
}: ExtraProductsBlockComponentProps) {
  const branding = useCompanyBranding();
  const { pillBadge = "Extra products" } = block.data || {};
  const [includedMap, setIncludedMap] = useState<Record<string, boolean>>({});
  const [modalOption, setModalOption] = useState<ExtraProductOption | null>(null);

  const handleToggle = (prodId: string, shouldInclude: boolean) => {
    setIncludedMap((prev) => ({
      ...prev,
      [prodId]: shouldInclude,
    }));
    if (onToggleExtraProduct) {
      onToggleExtraProduct(prodId, shouldInclude);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      
      {/* 1. TOP HEADER ROW: Green Rounded Label on LEFT, Madola Logo on RIGHT */}
      <div className="flex items-center justify-between -mx-8 sm:-mx-12 -mt-4 mb-2">
        <div
          className="text-white font-bold text-xs px-5 py-2 rounded-r-full shadow-sm tracking-wider uppercase"
          style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
        >
          {pillBadge || "Extra products"}
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

      {/* 2. EXTRA PRODUCT CARDS */}
      <div className="space-y-6 pt-2">
        {DEFAULT_EXTRA_OPTIONS.map((prod) => {
          const isIncluded = Boolean(includedMap[prod.id]);

          return (
            <div key={prod.id} className="space-y-2">
              {/* Card */}
              <div className="p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 dark:border-emerald-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-emerald-500/50 transition-all">
                {/* Image */}
                <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shrink-0 shadow-inner">
                  <img src={prod.image} alt={prod.name} className="max-h-full max-w-full object-contain" />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                    {prod.brand}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                    {prod.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {prod.description}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalOption(prod)}
                      className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      Click for more details
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Toggle Bar */}
              <div className="flex items-center justify-end gap-4 px-2">
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold block leading-none">Total</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    £{prod.price.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400 block leading-none">NO VAT</span>
                </div>

                {/* Include / Exclude Toggle Pill */}
                <div className="inline-flex rounded-full p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleToggle(prod.id, true)}
                    className={`px-4 py-1.5 rounded-full transition-all ${
                      isIncluded
                        ? "bg-emerald-500 text-white shadow-sm font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Include
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(prod.id, false)}
                    className={`px-4 py-1.5 rounded-full transition-all ${
                      !isIncluded
                        ? "bg-emerald-500 text-white shadow-sm font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Exclude
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {modalOption && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOption(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">{modalOption.brand}</span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">{modalOption.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOption(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 p-2 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <img src={modalOption.image} alt={modalOption.name} className="max-h-full max-w-full object-contain" />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {modalOption.description}
            </p>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{modalOption.details}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
