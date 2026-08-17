"use client";

import React, { useState } from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap, X, Check, ShieldCheck } from "lucide-react";

export interface EvChargerBlockComponentProps {
  block: ProposalBlock;
  proposal?: BlockProposal;
  onToggleEvCharger?: (included: boolean) => void;
  isAdmin?: boolean;
}

export interface EVOption {
  id: string;
  brand: string;
  name: string;
  price: number;
  image: string;
  description: string;
  details: string;
}

const DEFAULT_EV_OPTIONS: EVOption[] = [
  {
    id: "ev-sigenergy",
    brand: "SIGENERGY",
    name: "EV AC Charger",
    price: 1250,
    image: "https://images.unsplash.com/photo-1558441719-8b449c6ff8ff?auto=format&fit=crop&w=600&q=80",
    description:
      "With Sigen EV AC Charger, you can confidently use solar energy to power your electric vehicle. Use our fast home EV charging to optimize energy savings, embrace green technology, and enjoy a smarter charging experience. Seamlessly synchronized with SigenStor, it provides 100% green energy for your EV.",
    details:
      "7.4kW single-phase fast charger with IP65 weather rating, integrated solar tracking surge mode, RFID authentication, dynamic load balancing, and automated low-rate off-peak charging schedules.",
  },
  {
    id: "ev-hanchu",
    brand: "HANCHU ESS",
    name: "Hanchu EV Charge HC 7KW (T)",
    price: 1250,
    image: "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=600&q=80",
    description:
      "The Hanchu HC-EV-AC-07K EV Charger is a smart, 7kW single-phase charging solution designed for modern electric vehicle owners. It offers versatile charging options, including app control, RFID, and plug-and-play functionality, ensuring a seamless user experience. With advanced safety features like Type A + DC 6mA fault protection.",
    details:
      "7kW tethered Type 2 cable with PEN fault protection (no earth rod needed), integrated solar diverter mode, real-time energy metering via mobile app, and 3-year warranty.",
  },
  {
    id: "ev-duracell",
    brand: "DURACELL ENERGY",
    name: "Duracharger 7kW",
    price: 1250,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
    description:
      "Introducing the DURACELL EV Charger—a cutting-edge solution for efficient and eco-friendly electric vehicle charging. Designed to harness free solar energy, it ensures your vehicle is powered by the cleanest, most cost-effective electricity available. Seamlessly integrating with DURACELL Energy's battery systems.",
    details:
      "Smart 7.4kW dual-socket / tethered options, OCPP 1.6J compliant for smart energy tariffs (Octopus Intelligent, OVO Charge Anywhere), and 3-year British warranty.",
  },
  {
    id: "ev-foxess",
    brand: "FOX ESS",
    name: "Fox ESS 7kW EV Charger",
    price: 1250,
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80",
    description:
      "The AC EV Charger boasts a streamlined design that is simple yet elegant, compact, intelligent, and easy to use. Engineered to work in tandem with Fox ESS hybrid inverters to maximize self-consumption of surplus rooftop solar.",
    details:
      "7.3kW wall-mounted AC charger with Wi-Fi / Bluetooth control, RFID tags, solar export matching, and automated overnight cheap-rate scheduling.",
  },
];

export function EvChargerBlockComponent({
  block,
  proposal,
  onToggleEvCharger,
}: EvChargerBlockComponentProps) {
  const branding = useCompanyBranding();
  const { pillBadge = "Add an EV?", heading = "Add an EV Charger?" } = block.data || {};
  const [selectedChargerId, setSelectedChargerId] = useState<string | null>(null);
  const [modalOption, setModalOption] = useState<EVOption | null>(null);

  const handleToggle = (chargerId: string) => {
    if (selectedChargerId === chargerId) {
      setSelectedChargerId(null);
      if (onToggleEvCharger) onToggleEvCharger(false);
    } else {
      setSelectedChargerId(chargerId);
      if (onToggleEvCharger) onToggleEvCharger(true);
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
          {pillBadge || "Add an EV?"}
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

      {/* 2. HEADING */}
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      {/* 3. FOUR EV CHARGER CARDS */}
      <div className="space-y-6 pt-2">
        {DEFAULT_EV_OPTIONS.map((ev) => {
          const isIncluded = selectedChargerId === ev.id;

          return (
            <div key={ev.id} className="space-y-2">
              {/* Product Card */}
              <div className="p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 dark:border-emerald-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-emerald-500/50 transition-all">
                {/* Image */}
                <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shrink-0 shadow-inner">
                  <img src={ev.image} alt={ev.name} className="max-h-full max-w-full object-contain" />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                    {ev.brand}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                    {ev.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {ev.description}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalOption(ev)}
                      className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      Click for more details
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Toggle Bar Matching Screenshot */}
              <div className="flex items-center justify-end gap-4 px-2">
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold block leading-none">Total</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    £{ev.price.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400 block leading-none">NO VAT</span>
                </div>

                {/* Include / Exclude Toggle Pill */}
                <div className="inline-flex rounded-full p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleToggle(ev.id)}
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
                    onClick={() => handleToggle(ev.id)}
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
