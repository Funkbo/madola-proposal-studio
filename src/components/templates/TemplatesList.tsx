"use client";

import React, { useState } from "react";
import { ProposalTemplate } from "@/types/template";
import { ProposalBlock } from "@/types/block-proposal";
import { InteractiveProposalView } from "@/components/proposal/InteractiveProposalView";
import { DEFAULT_MASTER_PROPOSAL } from "@/lib/repositories/interactiveProposalRepository";
import { TemplateEditorModal } from "./TemplateEditorModal";
import { Edit3, Sparkles, ArrowRight, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export interface TemplatesListProps {
  initialTemplates: ProposalTemplate[];
}

export function TemplatesList({ initialTemplates }: TemplatesListProps) {
  const [templates, setTemplates] = useState<ProposalTemplate[]>(initialTemplates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalState, setProposalState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("madola_template_template-madola-standard");
        if (saved) {
          const parsed = JSON.parse(saved);
          const cover = parsed.blocks?.find((b: any) => b.type === "cover");
          const ourWork = parsed.blocks?.find((b: any) => b.type === "our_work");
          return {
            ...DEFAULT_MASTER_PROPOSAL,
            reference: "2C1BFH47BMWY",
            customer: {
              name: "[Customer Name]",
              email: "[Customer Email]",
              phone: "[Customer Phone]",
              address: "[Property Address]",
              postcode: "[Postcode]",
            },
            heroImage: cover?.data?.heroImage || DEFAULT_MASTER_PROPOSAL.heroImage || "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
            preparedBy: {
              ...DEFAULT_MASTER_PROPOSAL.preparedBy,
              ...(cover?.data?.preparedBy || {}),
            },
            galleryImages: ourWork?.data?.images || DEFAULT_MASTER_PROPOSAL.galleryImages || [],
          };
        }
      } catch (e) {
        console.warn("Template local read warning", e);
      }
    }
    return {
      ...DEFAULT_MASTER_PROPOSAL,
      reference: "2C1BFH47BMWY",
      customer: {
        name: "[Customer Name]",
        email: "[Customer Email]",
        phone: "[Customer Phone]",
        address: "[Property Address]",
        postcode: "[Postcode]",
      },
    };
  });

  const masterTemplate = templates[0] || {
    id: "template-madola-standard",
    name: "Madola Master Base Proposal Template",
    description: "Primary master proposal structure. All uploaded OpenSolar PDFs automatically populate this template.",
    active: true,
    createdBy: "abbceaf7-c24b-4984-a7e1-a2ee000d3bfe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleSaveSuccess = (updatedTpl: ProposalTemplate, blocks?: ProposalBlock[]) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === updatedTpl.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedTpl;
        return copy;
      }
      return [updatedTpl, ...prev];
    });

    if (blocks && blocks.length > 0) {
      const cover = blocks.find((b) => b.type === "cover");
      const ourWork = blocks.find((b) => b.type === "our_work");
      setProposalState((prev: any) => ({
        ...prev,
        heroImage: cover?.data?.heroImage || prev.heroImage,
        preparedBy: {
          ...prev.preparedBy,
          ...(cover?.data?.preparedBy || {}),
        },
        galleryImages: ourWork?.data?.images || prev.galleryImages,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Master Base Proposal Template</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Master Proposal Template Layout</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              This layout is identical to the final customer proposal view. Any pictures, images, or section text you edit here will automatically reflect on all customer proposals!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition"
            >
              <ImageIcon className="w-4 h-4" /> Upload Pictures & Media
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition"
            >
              <Edit3 className="w-4 h-4" /> Edit Template Sections
            </button>

            <Link
              href="/proposals/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              <span>Upload OpenSolar PDF</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Showing Master Template Layout. Real customer names & pricing will populate when an OpenSolar PDF is uploaded.</span>
        </div>
      </div>

      {/* Render Exact Customer Proposal View Component */}
      <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-white">
        <InteractiveProposalView proposal={proposalState} />
      </div>

      {/* Media & Section Editor Modal */}
      <TemplateEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={masterTemplate}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
