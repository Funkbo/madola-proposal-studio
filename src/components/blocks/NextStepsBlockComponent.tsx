"use client";

import React from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap } from "lucide-react";

export interface NextStepsBlockComponentProps {
  block: ProposalBlock;
  proposal?: any;
  isAdmin?: boolean;
}

const DEFAULT_NEXT_STEPS = [
  {
    stepNum: 1,
    title: "Survey and design",
    desc: "Our surveyor checks your roof structure, electrics and access, and we finalise your design and your price. You're assigned a project coordinator who stays with you from here to handover — one name and one number throughout. Nothing to pay at this stage.",
  },
  {
    stepNum: 2,
    title: "Deposit and scheduling",
    desc: "With the design agreed we take 25%, protected under our HIES insurance-backed guarantee. We apply to your network operator for grid approval and book your scaffold and install dates. Grid approval is what sets your timeline, so we start it the day the design is signed off.",
  },
  {
    stepNum: 3,
    title: "Installation",
    desc: "Scaffold goes up, the system goes in, and we test and commission it. Most homes are done in one to two days. Your power is off for under two hours while we connect to the consumer unit, agreed with you in advance.",
  },
  {
    stepNum: 4,
    title: "Completion",
    desc: "The remaining 75% falls due once the system is live. We issue your MCS certificate, register the electrical work with building control under our NAPIT registration, set up your monitoring app and hand over your documentation pack.",
  },
  {
    stepNum: 5,
    title: "Aftercare",
    desc: "Two jobs are yours: tell your home insurer the panels are on, as they now form part of the building, and apply to your energy supplier for a Smart Export Guarantee tariff. We'll point you at the best rates. Everything else is ours — MCS registration, network operator sign-off, building control, manufacturer warranty registration and scaffold removal. Your coordinator stays with you through your first bill.",
  },
];

export function NextStepsBlockComponent({ block }: NextStepsBlockComponentProps) {
  const branding = useCompanyBranding();
  const { pillBadge = "Text", heading = "Next Steps", steps = DEFAULT_NEXT_STEPS } = block.data || {};

  const displaySteps = Array.isArray(steps) && steps.length > 0 ? steps : DEFAULT_NEXT_STEPS;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      
      {/* 1. TOP HEADER ROW: Green Rounded Label on LEFT, Madola Logo on RIGHT */}
      <div className="flex items-center justify-between -mx-8 sm:-mx-12 -mt-4 mb-2">
        <div
          className="text-white font-bold text-xs px-5 py-2 rounded-r-full shadow-sm tracking-wider uppercase"
          style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
        >
          {pillBadge || "Text"}
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

      {/* 2. TITLE */}
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      {/* 3. NUMBERED LIST */}
      <div className="space-y-4 pt-2">
        {displaySteps.map((st: any, idx: number) => {
          const num = st.stepNum || idx + 1;

          return (
            <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-slate-100 min-w-[20px]">
                {num}.
              </span>
              <div>
                <strong className="font-extrabold text-slate-900 dark:text-slate-100">
                  {st.title} —{" "}
                </strong>
                <span>{st.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
