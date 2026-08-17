"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap, Mail, MapPin, Sun, Battery } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  isAdmin?: boolean;
}

export function CoverBlockComponent({ block, proposal }: BlockComponentProps) {
  const branding = useCompanyBranding();
  const [logoError, setLogoError] = React.useState(false);
  const { proposalTitle, subtitle, heroImage, preparedBy, greeting, introText } = block.data || {};

  const customerName = proposal.customer?.name || "Valued Customer";
  const authorName = preparedBy?.name || `${branding.companyName} Specialist`;
  const authorEmail = preparedBy?.email || branding.email;
  const authorAvatar =
    preparedBy?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

  const resolvedGreeting = greeting ? greeting.replace("[Customer Name]", customerName) : `Hi ${customerName},`;
  const resolvedIntro = introText ? introText.replace("[Customer Name]", customerName) : "";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      
      {/* 1. TOP HEADER ROW: Solid Green Rounded Pill on LEFT, Madola Logo on RIGHT */}
      <div className="flex items-center justify-between">
        <div className="bg-emerald-500 text-white font-bold text-xs px-5 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
          Cover
        </div>

        <div className="flex items-center gap-2">
          {!logoError && branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              onError={() => setLogoError(true)}
              className="h-8 max-w-[160px] object-contain"
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

      {/* 2. MAIN PROPOSAL TITLE */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
          {proposalTitle || "Madola TEMPLATE"}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* 3. HERO IMAGE BANNER */}
      {heroImage && (
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800">
          <img
            src={heroImage}
            alt={proposalTitle || "Solar Roof Installation"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 4. PREPARED BY AUTHOR SECTION */}
      <div className="pt-1 flex items-center gap-3.5">
        <img
          src={authorAvatar}
          alt={authorName}
          className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
        />
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
            Prepared by {authorName}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{authorEmail}</p>
          <span className="text-[10px] text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer font-medium block">
            Click to learn more about me
          </span>
        </div>
      </div>

      {/* 5. GREETING & INTRO LETTER COPY */}
      <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
        {resolvedGreeting && (
          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {resolvedGreeting}
          </p>
        )}

        {resolvedIntro && (
          <div className="space-y-3 whitespace-pre-line">
            {resolvedIntro}
          </div>
        )}
      </div>

    </div>
  );
}
