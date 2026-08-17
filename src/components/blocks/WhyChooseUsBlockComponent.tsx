"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap, CheckCircle2 } from "lucide-react";
import { DEFAULT_ACCREDITATION_LOGOS } from "@/lib/media-library";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal?: BlockProposal;
  isAdmin?: boolean;
}

export function WhyChooseUsBlockComponent({ block }: BlockComponentProps) {
  const branding = useCompanyBranding();
  const {
    heading = `Why Choose ${branding.companyName.split(" ")[0]}?`,
    paragraph1,
    paragraph2,
    madolaWayHeading = `The ${branding.companyName.split(" ")[0]} way`,
    benefits = [],
    closingLine = `Go Solar, with ${branding.companyName.split(" ")[0]}!`,
    accreditations = DEFAULT_ACCREDITATION_LOGOS,
  } = block.data || {};

  const defaultPara1 =
    `${branding.companyName} is a leading provider of solar power solutions for businesses and homes across the UK. Since our founding in 2013, we’ve been dedicated to providing high-quality, reliable, and sustainable solar power installations that help our customers save money, reduce their carbon footprint, and make a positive impact on the environment.`;
  const defaultPara2 =
    "We are committed to staying at the forefront of new and innovative technologies in the solar power industry, and to deliver tailored solutions that meet the unique needs of each customer.";

  const text1 = paragraph1 !== undefined ? paragraph1 : defaultPara1;
  const text2 = paragraph2 !== undefined ? paragraph2 : defaultPara2;

  const displayBenefits =
    benefits && benefits.length > 0
      ? benefits
      : [
          {
            title: "Certified and accredited",
            desc: "by leading industry organisations, ensuring the highest standards of quality and performance.",
          },
          {
            title: "Free consultation and support",
            desc: "from our team of experts to help you make informed decisions and choose the best solar power solutions for your needs.",
          },
        ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-8 text-slate-900 dark:text-slate-100 font-sans antialiased">
      
      {/* 1. TOP HEADER ROW: Green Rounded Label on LEFT, Madola Logo on RIGHT */}
      <div className="flex items-center justify-between -mx-8 sm:-mx-12 -mt-4 mb-2">
        <div className="bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-r-full shadow-sm tracking-wider uppercase">
          Why Choose Us?
        </div>

        <div className="flex items-center gap-2 pr-8 sm:pr-12">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.companyName} className="h-8 max-w-[160px] object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-slate-50 uppercase">
                {branding.companyName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN HEADING */}
      <div className="pt-2">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      {/* 3. INTRODUCTION COPY */}
      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
        {text1 && <p>{text1}</p>}
        {text2 && <p>{text2}</p>}
      </div>

      {/* 4. THE MADOLA WAY */}
      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <span>{madolaWayHeading}</span>
        </h3>

        <div className="space-y-3 pl-1">
          {displayBenefits.map((item: any, idx: number) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div className="text-sm">
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.title} </span>
                <span className="text-slate-600 dark:text-slate-400">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CLOSING LINE */}
      {closingLine && (
        <div className="pt-2">
          <p className="text-sm font-bold italic text-emerald-600 dark:text-emerald-400">
            {closingLine}
          </p>
        </div>
      )}

      {/* 6. ACCREDITATION LOGOS HORIZONTAL ROW */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* HIES */}
        <div className="h-12 px-3 rounded-xl bg-emerald-700 text-white font-extrabold text-[10px] flex items-center justify-center text-center uppercase shadow-sm">
          HIES<br/>Accredited Member
        </div>
        {/* TSI Approved Code */}
        <div className="h-12 px-3 rounded-xl bg-purple-900 text-white font-bold text-[9px] flex flex-col justify-center border border-purple-700">
          <span className="text-pink-300 font-extrabold text-[8px] uppercase">tsi</span>
          <span className="font-black text-[9px] leading-none uppercase">APPROVED CODE</span>
          <span className="text-[7px] text-purple-300">TRADINGSTANDARDS.UK</span>
        </div>
        {/* SafeContractor */}
        <div className="h-12 px-3 rounded-xl bg-slate-900 text-white font-bold text-[9px] flex items-center gap-1.5 border border-slate-700">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">✓</div>
          <div>
            <div className="font-extrabold text-[9px] leading-none uppercase">SafeContractor</div>
            <div className="text-[8px] text-slate-400 font-medium">APPROVED</div>
          </div>
        </div>
        {/* OLEV */}
        <div className="h-12 px-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold text-[10px] flex flex-col justify-center uppercase">
          <div className="font-black tracking-wider text-xs leading-none">OLEV</div>
          <div className="text-[7px] text-emerald-700 font-semibold tracking-tight">approved installer</div>
        </div>
        {/* TRUSTMARK */}
        <div className="h-12 px-3.5 rounded-xl bg-teal-800 text-white font-extrabold text-[10px] flex flex-col justify-center uppercase shadow-sm">
          <div className="font-black tracking-wider text-xs leading-none text-teal-300">TRUSTMARK</div>
          <div className="text-[7px] text-teal-100 font-medium">Government Endorsed Quality</div>
        </div>
        {/* NAPIT */}
        <div className="h-12 px-4 rounded-xl bg-blue-950 text-white font-black text-sm flex items-center gap-1 border border-blue-800 shadow-sm">
          <span className="text-red-500 text-lg">✓</span>
          <span className="tracking-wider">NAPIT</span>
        </div>
        {/* City & Guilds */}
        <div className="h-12 px-3 rounded-xl bg-red-700 text-white font-bold text-[9px] flex flex-col justify-center uppercase shadow-sm">
          <div className="font-black text-[10px] leading-none">City & Guilds</div>
          <div className="text-[7px] text-red-100 font-medium mt-0.5">Accredited Programme</div>
        </div>
      </div>

    </div>
  );
}
