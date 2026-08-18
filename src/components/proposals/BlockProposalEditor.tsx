"use client";

import React, { useState, useEffect } from "react";
import { BlockProposal, ProposalBlock, ProposalBlockType } from "@/types/block-proposal";
import { createDefaultProposal, calculateProposalTotals } from "@/lib/block-defaults";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { BlockSettingsModal } from "@/components/editors/BlockSettingsModal";
import { Customer } from "@/types/customer";
import { ProposalTemplate } from "@/types/template";
import { saveSolarSystem, getSolarSystemByProposalId } from "@/lib/repositories/solarSystemRepository";
import { saveFinancials, getFinancialsByProposalId } from "@/lib/repositories/financialRepository";
import { saveProposalBlocks, getProposalBlocksByProposalId } from "@/lib/repositories/proposalBlockRepository";
import { saveProposalProducts, getProposalProductsByProposalId } from "@/lib/repositories/proposalProductRepository";
import { savePaymentMilestones, getPaymentMilestonesByProposalId } from "@/lib/repositories/paymentMilestoneRepository";
import { updateProposalAcceptance, getProposalAcceptanceByProposalId } from "@/lib/repositories/proposalAcceptanceRepository";
import { publishProposal } from "@/lib/repositories/proposalRepository";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Save,
  ExternalLink,
  Sun,
  Battery,
  Zap,
  Sliders,
  Check,
  FileText,
  ListTree,
  Layers,
  Sparkles,
  ArrowLeft,
  Pencil,
  AlertCircle,
  Globe,
  Share2,
} from "lucide-react";
import Link from "next/link";

export interface BlockProposalEditorProps {
  customers: Customer[];
  templates: ProposalTemplate[];
  initialProposalId?: string;
}

export function BlockProposalEditor({ customers, templates, initialProposalId }: BlockProposalEditorProps) {
  const [proposal, setProposal] = useState<BlockProposal>(createDefaultProposal());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [showConfiguratorModal, setShowConfiguratorModal] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Editing Block Modal State
  const [editingBlock, setEditingBlock] = useState<ProposalBlock | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Restore saved proposal state on mount from Repositories
  useEffect(() => {
    async function loadSavedProposal() {
      try {
        const propId = initialProposalId || proposal.id || "proposal-default-1";

        const savedBlocks = await getProposalBlocksByProposalId(propId);
        const savedSolar = await getSolarSystemByProposalId(propId);
        const savedFinancials = await getFinancialsByProposalId(propId);
        const savedMilestones = await getPaymentMilestonesByProposalId(propId);

        setProposal((prev) => {
          const updated = { ...prev };
          if (savedBlocks && savedBlocks.length > 0) {
            updated.blocks = savedBlocks;
          }
          if (savedSolar) {
            updated.panelCount = savedSolar.panelCount;
            updated.panelWattage = savedSolar.panelWattage;
            updated.systemSizeKw = savedSolar.systemSizeKwp.toString();
            updated.batteryCapacity = savedSolar.batteryCapacityKwh || 13.5;
            updated.inverterRating = savedSolar.inverterCapacityKw || 5.0;
          }
          if (savedFinancials) {
            updated.basePrice = savedFinancials.systemPrice;
          }
          if (savedMilestones && savedMilestones.length > 0) {
            updated.paymentSchedule = savedMilestones;
          }
          return updated;
        });
      } catch (e) {
        console.error("Failed to load proposal state from repository", e);
      }
    }

    try {
      const saved = localStorage.getItem("madola_current_proposal");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.blocks && parsed.blocks.length > 0) {
          setProposal(parsed);
        }
      }
    } catch (e) {}

    loadSavedProposal();
  }, [initialProposalId]);

  // Save Proposal to Repositories & Supabase
  const handleSaveProposal = async (updatedProposal?: BlockProposal) => {
    const target = updatedProposal || proposal;
    const totals = calculateProposalTotals(target);
    const updated = {
      ...target,
      updatedAt: new Date().toISOString(),
    };
    setProposal(updated);

    const propId = updated.id || "proposal-default-1";

    try {
      await saveProposalBlocks(propId, updated.blocks);

      await saveSolarSystem(propId, {
        proposalId: propId,
        systemSizeKwp: (updated.panelCount * updated.panelWattage) / 1000,
        panelCount: updated.panelCount,
        panelWattage: updated.panelWattage,
        panelManufacturer: "LONGi",
        panelModel: "Hi-MO X6 Max",
        batteryCapacityKwh: updated.batteryCapacity,
        inverterCapacityKw: updated.inverterRating,
      });

      await saveFinancials(propId, {
        proposalId: propId,
        systemPrice: totals.basePrice,
        vat: totals.vatAmount,
        deposit: totals.depositAmount,
        annualSaving: totals.annualSavings,
        lifetimeSaving: totals.annualSavings * 25,
        paybackYears: parseFloat(totals.paybackYears) || 6.4,
        electricityRate: 0.28,
        exportRate: 0.15,
        inflationRate: 0.03,
      });

      await savePaymentMilestones(propId, updated.paymentSchedule, totals.finalTotal);

      const productItems = [];
      if (updated.evCharger) {
        productItems.push({
          proposalId: propId,
          quantity: 1,
          unitPrice: updated.evCharger.price,
          included: updated.evCharger.included,
          customName: updated.evCharger.name,
          customDescription: updated.evCharger.description,
        });
      }
      if (updated.extraProducts) {
        updated.extraProducts.forEach((p) => {
          productItems.push({
            proposalId: propId,
            quantity: 1,
            unitPrice: p.price,
            included: p.included,
            customName: p.name,
            customDescription: p.description,
          });
        });
      }
      await saveProposalProducts(propId, productItems);

      await updateProposalAcceptance(propId, updated.status === "accepted" ? "accepted" : "pending", updated.customer?.name, updated.customer?.email);

      localStorage.setItem("madola_current_proposal", JSON.stringify(updated));
      const existingList = localStorage.getItem("madola_saved_proposals_list");
      const list = existingList ? JSON.parse(existingList) : [];
      const updatedList = [updated, ...list.filter((p: any) => p.reference !== updated.reference)];
      localStorage.setItem("madola_saved_proposals_list", JSON.stringify(updatedList));

      setSaveErrorMsg(null);
      setSaveSuccessMsg(`Proposal ${updated.reference} saved successfully!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      return updated;
    } catch (e: any) {
      console.warn("Storage warning when saving proposal", e);
      setSaveSuccessMsg(null);
      setSaveErrorMsg("Proposal saved to local fallback mode.");
      setTimeout(() => setSaveErrorMsg(null), 4000);
      return updated;
    }
  };

  // Publish Proposal Action
  const handlePublishProposal = async () => {
    const saved = await handleSaveProposal();
    const propId = saved?.id || proposal.id || "proposal-default-1";

    const res = await publishProposal(propId, 30);
    if (res.publicUrl) {
      const fullUrl = `${window.location.origin}${res.publicUrl}`;
      setPublishedUrl(fullUrl);
      setProposal((prev) => ({ ...prev, status: "published" }));
      setSaveSuccessMsg(`Proposal Published! Public Token: ${res.publicToken}`);
    } else {
      setSaveErrorMsg(res.error || "Failed to publish proposal.");
    }
  };

  const handleCopyLink = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handleLaunchCustomerView = async () => {
    if (publishedUrl) {
      window.open(publishedUrl, "_blank");
      return;
    }
    const saved = await handleSaveProposal();
    const ref = saved?.reference || proposal.reference || "MAD-2026-00001";
    window.open(`/p/${ref}`, "_blank");
  };

  // Block Editing Handlers
  const handleOpenEditBlock = (block: ProposalBlock) => {
    setEditingBlock(block);
    setIsSettingsModalOpen(true);
  };

  const handleSaveBlockData = (blockId: string, data: any) => {
    const updatedBlocks = proposal.blocks.map((b) =>
      b.id === blockId ? { ...b, data } : b
    );
    const updatedProposal = { ...proposal, blocks: updatedBlocks };
    handleSaveProposal(updatedProposal);
  };

  const handleUpdateProposalState = (updatedProposal: BlockProposal) => {
    handleSaveProposal(updatedProposal);
  };

  // Block Manipulation Handlers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...proposal.blocks];
    const temp = newBlocks[index - 1];
    newBlocks[index - 1] = newBlocks[index];
    newBlocks[index] = temp;
    newBlocks.forEach((b, i) => (b.order = i + 1));
    handleSaveProposal({ ...proposal, blocks: newBlocks });
  };

  const handleMoveDown = (index: number) => {
    if (index === proposal.blocks.length - 1) return;
    const newBlocks = [...proposal.blocks];
    const temp = newBlocks[index + 1];
    newBlocks[index + 1] = newBlocks[index];
    newBlocks[index] = temp;
    newBlocks.forEach((b, i) => (b.order = i + 1));
    handleSaveProposal({ ...proposal, blocks: newBlocks });
  };

  const handleDuplicateBlock = (index: number) => {
    const target = proposal.blocks[index];
    const newBlock: ProposalBlock = {
      ...target,
      id: `block-copy-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: index + 2,
      data: JSON.parse(JSON.stringify(target.data)),
    };
    const newBlocks = [...proposal.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    newBlocks.forEach((b, i) => (b.order = i + 1));
    handleSaveProposal({ ...proposal, blocks: newBlocks });
  };

  const handleToggleEnable = (index: number) => {
    const newBlocks = [...proposal.blocks];
    newBlocks[index].enabled = !newBlocks[index].enabled;
    handleSaveProposal({ ...proposal, blocks: newBlocks });
  };

  const handleDeleteBlock = (index: number) => {
    if (proposal.blocks.length <= 1) return;
    const newBlocks = proposal.blocks.filter((_, i) => i !== index);
    newBlocks.forEach((b, i) => (b.order = i + 1));
    handleSaveProposal({ ...proposal, blocks: newBlocks });
  };

  const handleAddBlock = (type: ProposalBlockType, insertIndex?: number) => {
    const typeTitles: Record<ProposalBlockType, string> = {
      cover: "Proposal Cover",
      why_choose_us: "Why Choose Us?",
      text: "Custom Text / Notes Section",
      our_work: "Installation Gallery",
      panel_layout: "Solar Panel Layout & Output",
      product_highlights: "Product Highlights",
      technical_details: "Technical Details",
      performance_estimates: "Performance Estimates",
      energy_usage: "Energy Usage & Profile",
      self_consumption: "Self-Consumption",
      before_after_solar: "Before vs After Solar",
      pricing: "Pricing & System",
      savings: "Savings",
      return_on_investment: "Return on Investment",
      whats_included: "Package Components",
      ev_charger: "Smart EV Charger Add-On",
      extra_products: "Optional Equipment Selector",
      next_steps: "Installation Roadmap",
      payment_schedule: "Payment Schedule Milestones",
      final_price_summary: "Itemized Cost Summary",
      acceptance: "Proposal Acceptance CTA",
    };

    const newBlock: ProposalBlock = {
      id: `block-${Date.now()}`,
      type,
      title: `${typeTitles[type] || type}`,
      order: (insertIndex !== undefined ? insertIndex : proposal.blocks.length) + 1,
      enabled: true,
      data: {
        heading: typeTitles[type],
        bodyText: "Editable block content...",
      },
    };

    const newBlocks = [...proposal.blocks];
    if (insertIndex !== undefined) {
      newBlocks.splice(insertIndex + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    newBlocks.forEach((b, i) => (b.order = i + 1));
    handleSaveProposal({ ...proposal, blocks: newBlocks });
  };

  const handleToggleEvCharger = (included: boolean) => {
    if (!proposal.evCharger) return;
    const updated = {
      ...proposal,
      evCharger: {
        ...proposal.evCharger,
        included,
        selected: included,
      },
    };
    handleSaveProposal(updated);
  };

  const handleToggleExtraProduct = (productId: string, included: boolean) => {
    const updatedExtras = proposal.extraProducts.map((p) =>
      p.id === productId ? { ...p, included } : p
    );
    const updated = {
      ...proposal,
      extraProducts: updatedExtras,
    };
    handleSaveProposal(updated);
  };

  const scrollToBlock = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totals = calculateProposalTotals(proposal);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans antialiased">
      {/* Top Action Bar */}
      <div className="sticky top-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/proposals">
            <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Block Proposal Editor
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-mono font-bold">
                {proposal.reference}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                proposal.status === "published"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : proposal.status === "accepted"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}>
                {proposal.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {proposal.customer?.name || "Proposal Document"}
            </h2>
          </div>
        </div>

        {/* Live System Spec Badges */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-bold font-mono">
            <Sun className="w-3.5 h-3.5" />
            <span>{proposal.systemSizeKw} kW</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center gap-1.5 font-bold font-mono">
            <Battery className="w-3.5 h-3.5" />
            <span>{proposal.batteryCapacity} kWh</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-bold font-mono">
            <span>Total: £{totals.finalTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Primary Editor Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfiguratorModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span>Specs</span>
          </button>

          <button
            onClick={() => handleSaveProposal()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublishProposal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4" />
            <span>Publish Proposal</span>
          </button>

          <button
            onClick={handleLaunchCustomerView}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview Customer Link</span>
          </button>
        </div>
      </div>

      {publishedUrl && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <div>
              <span className="font-bold block">Public Customer Link Live</span>
              <span className="font-mono text-[11px] text-blue-600 dark:text-blue-300">{publishedUrl}</span>
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copySuccess ? "Copied!" : "Copy Customer Link"}</span>
          </button>
        </div>
      )}

      {saveSuccessMsg && !publishedUrl && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono">Persisted to Supabase Database</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{saveErrorMsg}</span>
          </div>
          <span className="text-[11px] text-amber-600 font-mono">Storage Warning</span>
        </div>
      )}

      {/* Main Grid: Left Document Canvas (8 cols) & Right Outline Drawer (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Document Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Proposal Document Canvas ({proposal.blocks.length} Blocks)</span>
          </div>

          {proposal.blocks.map((block, index) => (
            <div
              key={block.id}
              id={block.id}
              className={`group relative rounded-3xl transition-all ${
                block.enabled ? "opacity-100" : "opacity-50 grayscale"
              }`}
            >
              {/* Admin Control Bar for Block */}
              <div className="p-3 bg-slate-900/90 backdrop-blur-md text-white rounded-t-3xl border-t border-x border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold flex items-center justify-center text-[11px]">
                    {index + 1}
                  </span>
                  <span className="font-bold text-white tracking-wide">{block.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {block.type}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* EDIT BLOCK BUTTON */}
                  <button
                    onClick={() => handleOpenEditBlock(block)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Block</span>
                  </button>

                  <div className="h-4 w-[1px] bg-slate-700 mx-1" />

                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Move Up"
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === proposal.blocks.length - 1}
                    title="Move Down"
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicateBlock(index)}
                    title="Duplicate Block"
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleEnable(index)}
                    title={block.enabled ? "Disable Block" : "Enable Block"}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
                  >
                    {block.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                  </button>

                  <button
                    onClick={() => handleDeleteBlock(index)}
                    title="Delete Block"
                    className="p-1.5 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Render Block Content */}
              <div className="border-x border-b border-slate-200 dark:border-slate-800 rounded-b-3xl overflow-hidden">
                <BlockRenderer
                  block={block}
                  proposal={proposal}
                  isAdmin={true}
                  onToggleEvCharger={handleToggleEvCharger}
                  onToggleExtraProduct={handleToggleExtraProduct}
                />
              </div>

              {/* In-between "Add Block" bar */}
              <div className="pt-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleAddBlock("text", index)}
                  className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Insert Block Here</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Outline Navigation Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ListTree className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Proposal Outline</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold">{proposal.blocks.length} sections</span>
            </div>

            {/* Block Navigation List */}
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {proposal.blocks.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => scrollToBlock(b.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    b.enabled
                      ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-800 dark:text-slate-200"
                      : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-semibold truncate">{b.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">{b.type}</span>
                </button>
              ))}
            </div>

            {/* Add New Block Selector */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                Add Block Type
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleAddBlock("text")}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-left font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Text / Notes</span>
                </button>
                <button
                  onClick={() => handleAddBlock("our_work")}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-left font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Work Gallery</span>
                </button>
                <button
                  onClick={() => handleAddBlock("extra_products")}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-left font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Extra Add-ons</span>
                </button>
                <button
                  onClick={() => handleAddBlock("ev_charger")}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 text-left font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>EV Charger</span>
                </button>
              </div>
            </div>

            {/* Quick Price Breakdown Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Base Solar System:</span>
                <span className="font-mono">£{totals.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Extra Products:</span>
                <span className="font-mono text-emerald-400">+£{totals.extraProductsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EV Charger Add-on:</span>
                <span className="font-mono text-emerald-400">+£{totals.evChargerPrice.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span>Turnkey Total:</span>
                <span className="font-mono text-emerald-400">£{totals.finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Block Settings Modal Panel */}
      <BlockSettingsModal
        block={editingBlock}
        proposal={proposal}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveBlockData={handleSaveBlockData}
        onUpdateProposal={handleUpdateProposalState}
      />

      {/* System Hardware Spec Configurator Modal */}
      {showConfiguratorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">System Hardware Configurator</h3>
              </div>
              <button
                onClick={() => setShowConfiguratorModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Number of PV Panels
                  </label>
                  <input
                    type="number"
                    value={proposal.panelCount}
                    onChange={(e) => {
                      const count = Math.max(1, parseInt(e.target.value) || 1);
                      const kw = ((count * proposal.panelWattage) / 1000).toFixed(1);
                      handleSaveProposal({ ...proposal, panelCount: count, systemSizeKw: kw });
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Panel Rating (Watts)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={proposal.panelWattage}
                    onChange={(e) => {
                      const watt = Math.max(100, parseInt(e.target.value) || 450);
                      const kw = ((proposal.panelCount * watt) / 1000).toFixed(1);
                      handleSaveProposal({ ...proposal, panelWattage: watt, systemSizeKw: kw });
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Battery Storage (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={proposal.batteryCapacity}
                    onChange={(e) => handleSaveProposal({ ...proposal, batteryCapacity: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Base System Price (£)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={proposal.basePrice}
                    onChange={(e) => handleSaveProposal({ ...proposal, basePrice: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={proposal.customer.name}
                  onChange={(e) =>
                    handleSaveProposal({ ...proposal, customer: { ...proposal.customer, name: e.target.value } })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowConfiguratorModal(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Apply Hardware Specs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
