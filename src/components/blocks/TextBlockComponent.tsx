"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Star, CheckCircle2, MessageSquare, ExternalLink, Zap } from "lucide-react";

export interface TextBlockComponentProps {
  block: ProposalBlock;
  isAdmin?: boolean;
}

const DEFAULT_TRUSTPILOT_REVIEWS = [
  {
    id: "rev-1",
    author: "David R.",
    location: "Surrey, UK",
    date: "Verified Homeowner",
    rating: 5,
    title: "Outstanding service & flawless installation",
    comment:
      "Madola Energy completed our 12-panel all-black installation in a single day. Neil and the installation team were professional, clean, and our system generated 28 kWh on the first sunny day!",
  },
  {
    id: "rev-2",
    author: "Sarah M.",
    location: "Richmond, Surrey",
    date: "Verified Customer",
    rating: 5,
    title: "Slashed our electricity bills from month one",
    comment:
      "The 5.4kW solar + 9.4kWh battery storage setup has been incredible. Electric bills dropped from £280/mo to under £45/mo. The mobile app gives full visibility over solar usage.",
  },
  {
    id: "rev-3",
    author: "James K.",
    location: "London, UK",
    date: "Verified Customer",
    rating: 5,
    title: "Transparent pricing & prompt MCS certification",
    comment:
      "Neil guided us through every step. No high-pressure sales, transparent pricing, and MCS certificates promptly registered with National Grid for SEG export payments.",
  },
];

export function TextBlockComponent({ block }: TextBlockComponentProps) {
  const branding = useCompanyBranding();
  const {
    heading = "Trustpilot review widget",
    bodyText,
    bulletPoints,
    isTrustpilot = true,
    pillBadge = "Text",
    videoUrl,
  } = block.data || {};

  const isTrustpilotWidget =
    isTrustpilot ||
    heading?.toLowerCase().includes("trustpilot") ||
    block.title?.toLowerCase().includes("trustpilot");

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

      {/* 2. MAIN TITLE */}
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {heading}
        </h2>
      </div>

      {/* 2b. EMBEDDED VIDEO */}
      {videoUrl && (
        <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800">
          <video src={videoUrl} controls className="w-full h-full object-cover" />
        </div>
      )}

      {/* 3. TRUSTPILOT REVIEW WIDGET */}
      {isTrustpilotWidget ? (
        <div className="space-y-6 pt-2">
          {/* Trustpilot Score Summary Bar */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Trustpilot Green Badge */}
              <div className="w-14 h-14 rounded-2xl bg-[#00b67a] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                ★
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">Excellent</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-[#00b67a] text-white flex items-center justify-center text-xs font-bold rounded-sm">
                        ★
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  TrustScore <strong className="text-slate-800 dark:text-slate-200 font-bold">4.9</strong> | <strong className="text-slate-800 dark:text-slate-200 font-bold">450+</strong> verified UK reviews
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#00b67a] bg-[#00b67a]/10 px-4 py-2 rounded-xl border border-[#00b67a]/20">
              <span>★ Trustpilot Verified</span>
            </div>
          </div>

          {/* Customer Reviews Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEFAULT_TRUSTPILOT_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <div key={i} className="w-3.5 h-3.5 bg-[#00b67a] text-white flex items-center justify-center text-[9px] font-bold rounded-sm">
                          ★
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {rev.date}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                    "{rev.title}"
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{rev.author}</span>
                  <span className="text-slate-400">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Text / Bullets View */
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {bodyText && <p>{bodyText}</p>}
          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="space-y-2.5 pt-2">
              {bulletPoints.map((point: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: "var(--brand-primary, #10b981)" }}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

    </div>
  );
}
