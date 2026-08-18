"use client";

import React, { useState, useEffect } from "react";
import { BlockProposal } from "@/types/block-proposal";
import { createDefaultProposal, calculateProposalTotals } from "@/lib/block-defaults";
import { getMasterTemplateBlocks, getMasterTemplateBlocksFromDb } from "@/lib/services/templateCache";
import { resolveBlockData, resolveTemplateVariables } from "@/lib/template-variables";
import { useCompanyBranding } from "@/lib/branding";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { getPublicProposalData, acceptPublicProposal } from "@/lib/repositories/proposalRepository";
import { notifyProposalAccepted } from "@/components/ui/NotificationDropdown";
import {
  Zap,
  Printer,
  Phone,
  Mail,
  CheckCircle,
  ListTree,
  AlertCircle,
  Clock,
  FileX,
  Check,
} from "lucide-react";

export interface CustomerBlockProposalViewProps {
  proposal?: BlockProposal;
  proposalId?: string;
  onUpdateProposal?: (updated: BlockProposal) => void;
}

export function CustomerBlockProposalView({
  proposal: initialProposal,
  proposalId,
  onUpdateProposal,
}: CustomerBlockProposalViewProps) {
  const branding = useCompanyBranding();
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [currentProposal, setCurrentProposal] = useState<BlockProposal>(
    initialProposal || createDefaultProposal()
  );
  const [publicState, setPublicState] = useState<{
    loading: boolean;
    errorType: string | null;
    errorMsg: string | null;
    proposalData: any | null;
  }>({
    loading: true,
    errorType: null,
    errorMsg: null,
    proposalData: null,
  });

  const [acceptanceSuccess, setAcceptanceSuccess] = useState<boolean>(false);
  const [acceptanceMsg, setAcceptanceMsg] = useState<string | null>(null);

  // Fetch Public Proposal presentation data via secure RPC
  useEffect(() => {
    async function loadPublicData() {
      const tokenOrId = proposalId || currentProposal.reference || "MAD-2026-00001";
      setPublicState((prev) => ({ ...prev, loading: true }));

      try {
        const res = await getPublicProposalData(tokenOrId);
        if (res?.error) {
          setPublicState({
            loading: false,
            errorType: res.error,
            errorMsg: res.message || "Proposal unavailable.",
            proposalData: null,
          });
        } else if (res?.status === "success" && res?.proposal) {
          setPublicState({
            loading: false,
            errorType: null,
            errorMsg: null,
            proposalData: res.proposal,
          });

          // Hydrate client state
          const localTemplateBlocks = getMasterTemplateBlocks();
          let templateBlocks = localTemplateBlocks;

          if (!(res.proposal.blocks && res.proposal.blocks.length > 0)) {
            const dbBlocks = await getMasterTemplateBlocksFromDb();
            if (dbBlocks && dbBlocks.length > 0) {
              templateBlocks = dbBlocks;
            }
          }

          const proposalBlocks =
            res.proposal.blocks && res.proposal.blocks.length > 0
              ? res.proposal.blocks
              : templateBlocks;

          if (proposalBlocks && proposalBlocks.length > 0) {
            const rpcLayoutImage =
              typeof res.proposal.layoutImage === "string" && res.proposal.layoutImage.length > 50
                ? res.proposal.layoutImage
                : undefined;
            const rpcHeroImage =
              typeof res.proposal.heroImage === "string" && res.proposal.heroImage.length > 50
                ? res.proposal.heroImage
                : undefined;

            setCurrentProposal((prev) => ({
              ...prev,
              reference: res.proposal.reference || prev.reference,
              status: res.proposal.status || prev.status,
              customer: {
                ...prev.customer,
                name: res.proposal.customer?.name || prev.customer.name,
                email: res.proposal.customer?.email || prev.customer.email,
              },
              heroImage: rpcHeroImage || prev.heroImage,
              layoutImage: rpcLayoutImage || prev.layoutImage,
              blocks: proposalBlocks.map((b: any) =>
                b.type === "panel_layout" && rpcLayoutImage && !b.data?.layoutImage
                  ? { ...b, data: { ...b.data, layoutImage: rpcLayoutImage } }
                  : b
              ),
              paymentSchedule: res.proposal.paymentSchedule || prev.paymentSchedule,
            }));
          }
        } else {
          setPublicState({
            loading: false,
            errorType: null,
            errorMsg: null,
            proposalData: null,
          });
        }
      } catch (e) {
        console.warn("Public proposal fetch failed; using client fallback", e);
        setPublicState({
          loading: false,
          errorType: null,
          errorMsg: null,
          proposalData: null,
        });
      }
    }

    loadPublicData();
  }, [proposalId]);

  // Observer to track active section while scrolling
  useEffect(() => {
    const enabledBlocks = currentProposal.blocks.filter((b) => b.enabled);
    if (enabledBlocks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    enabledBlocks.forEach((b) => {
      const el = document.getElementById(b.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentProposal.blocks]);

  const enabledBlocks = currentProposal.blocks
    .filter((b) => b.enabled)
    .map((b) => ({
      ...b,
      title: resolveTemplateVariables(b.title, currentProposal),
      data: resolveBlockData(b.data, currentProposal),
    }));
  const totals = calculateProposalTotals(currentProposal);

  const handlePrint = () => {
    window.print();
  };

  const scrollToBlock = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Secure Online Proposal Acceptance Action
  const handleAcceptOnline = async (signerName?: string, signerEmail?: string, notes?: string) => {
    const token = proposalId || currentProposal.reference;
    const res = await acceptPublicProposal(token, signerName, signerEmail, notes);

    if (res.success) {
      setAcceptanceSuccess(true);
      setAcceptanceMsg("Thank you! Proposal accepted successfully. Our engineering team will contact you shortly.");
      setCurrentProposal((prev) => ({ ...prev, status: "accepted" }));
      notifyProposalAccepted(
        currentProposal.reference,
        currentProposal.customer?.name || signerName || "Customer",
        `/p/${token}`
      );
    } else {
      setAcceptanceMsg(res.error || "Failed to submit acceptance.");
    }
  };

  // Render Public Error / Notice States
  if (!publicState.loading && publicState.errorType) {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans antialiased flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
          {publicState.errorType === "expired" ? (
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
          ) : publicState.errorType === "draft_unpublished" ? (
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
              <FileX className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-xl font-bold">
              {publicState.errorType === "expired"
                ? "Proposal Expired"
                : publicState.errorType === "draft_unpublished"
                ? "Proposal In Preparation"
                : "Proposal Unavailable"}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">{publicState.errorMsg}</p>
          </div>

          <div className="pt-4 border-t border-slate-700/80 flex flex-col gap-3">
            <a
              href={`tel:${branding.phone}`}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Advisor: {branding.phone}</span>
            </a>
            <span className="text-[11px] text-slate-400 font-mono">Reference: {proposalId || "N/A"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-24">
      
      {/* 1. PUBLIC STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.companyName} className="h-8 max-w-[160px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-base font-black tracking-wider text-slate-900 dark:text-slate-50 uppercase block leading-none">
                    {branding.companyName}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest block">
                    Solar Proposal Portal
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reference & Customer Spec */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold">
              Ref: {currentProposal.reference}
            </div>
            <div className="text-slate-600 dark:text-slate-300 font-semibold">
              Prepared for: <span className="text-slate-900 dark:text-slate-100 font-bold">{currentProposal.customer?.name}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Print PDF</span>
            </button>

            <a
              href={`tel:${branding.phone}`}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Us</span>
            </a>
          </div>

        </div>
      </header>

      {/* Acceptance Success Banner */}
      {acceptanceMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg ${
            acceptanceSuccess
              ? "bg-emerald-500 text-slate-950 border border-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>{acceptanceMsg}</span>
            </div>
            <span className="font-mono text-[11px] font-bold">STATUS: ACCEPTED</span>
          </div>
        </div>
      )}

      {/* 2. MAIN DOCUMENT LAYOUT GRID: 8 Cols Left (Document), 4 Cols Right (Sticky Outline) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CUSTOMER PROPOSAL DOCUMENT CANVAS (8 COLS) */}
          <div className="lg:col-span-8 space-y-8">
            {enabledBlocks.map((block) => (
              <div key={block.id} id={block.id} className="scroll-mt-24 transition-all">
                <BlockRenderer
                  block={block}
                  proposal={currentProposal}
                  isAdmin={false}
                  onAcceptProposal={handleAcceptOnline}
                />
              </div>
            ))}
          </div>

          {/* RIGHT: STICKY "PROPOSAL CONTENTS" & PRICE SUMMARY PANEL (4 COLS) */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            <div className="sticky top-24 space-y-6">
              
              {/* Proposal Contents Outline Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <ListTree className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      Proposal Contents
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    {enabledBlocks.length} sections
                  </span>
                </div>

                {/* Section Navigation List */}
                <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
                  {enabledBlocks.map((block, idx) => {
                    const isActive = activeSectionId === block.id;
                    return (
                      <button
                        key={block.id}
                        onClick={() => scrollToBlock(block.id)}
                        className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                          isActive
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-400 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-6 h-6 rounded-xl font-mono font-bold flex items-center justify-center text-[11px] shrink-0 ${
                              isActive
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate">{block.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Price Summary Box */}
              <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Turnkey Investment Summary
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    0% UK VAT
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Solar System ({currentProposal.systemSizeKw} kW):</span>
                    <span className="font-mono font-bold">£{totals.basePrice.toLocaleString()}</span>
                  </div>
                  {totals.extraProductsPrice > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Included Extra Equipment:</span>
                      <span className="font-mono text-emerald-400 font-bold">+£{totals.extraProductsPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.evChargerPrice > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Included EV Charger:</span>
                      <span className="font-mono text-emerald-400 font-bold">+£{totals.evChargerPrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Turnkey Total</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Includes Scaffolding & MCS</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    £{totals.finalTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleAcceptOnline(currentProposal.customer?.name, currentProposal.customer?.email)}
                  disabled={currentProposal.status === "accepted"}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-colors shadow-lg flex items-center justify-center gap-2 ${
                    currentProposal.status === "accepted"
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{currentProposal.status === "accepted" ? "Proposal Accepted" : "Accept Proposal Online"}</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* 3. PUBLIC FOOTER */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.companyName} className="h-7 max-w-[140px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {branding.companyName}
                </span>
              </div>
            )}
            <span className="text-slate-400">•</span>
            <span>{branding.address}</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>{branding.phone}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-500" />
              <span>{branding.email}</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
