"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Proposal } from "@/types/proposal";
import { publishProposal } from "@/lib/repositories/proposalRepository";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatUKDate } from "@/lib/utils";
import {
  FileText,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Eye,
  Edit,
  Clock,
  AlertCircle,
  Sparkles,
  Sun,
  Battery,
  DollarSign,
  Lock,
} from "lucide-react";

interface ProposalDetailViewProps {
  proposal: Proposal;
  acceptanceData?: {
    acceptedAt?: string;
    customerName?: string;
    customerEmail?: string;
    notes?: string;
  } | null;
}

export function ProposalDetailView({ proposal: initialProposal, acceptanceData }: ProposalDetailViewProps) {
  const [proposal, setProposal] = useState<Proposal>(initialProposal);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Generate or get public token & URL
  const publicToken = proposal.publicToken || "pub_tok_7a9f8b2c1d4e6f3a";
  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${publicToken}`
    : `/p/${publicToken}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const res = await publishProposal(proposal.id);
      if (res.publicToken) {
        setProposal((prev) => ({
          ...prev,
          status: "published",
          publicToken: res.publicToken || prev.publicToken,
          publishedAt: new Date().toISOString(),
        }));
        setStatusMessage("Proposal published successfully!");
      }
    } catch (e: any) {
      setStatusMessage("Failed to publish proposal: " + e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const isAccepted = proposal.status === "accepted";
  const isExpired = proposal.status === "expired";
  const isPublished = proposal.status === "published";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/proposals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Proposals</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge status={proposal.status} />
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Proposal Lifecycle Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <FileText className="w-4 h-4" />
              <span>{proposal.reference}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
              Interactive Solar Proposal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Customer: <span className="font-semibold text-slate-800 dark:text-slate-200">{proposal.customerName}</span> ({proposal.customerEmail})
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/proposal/${publicToken}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1.5" />
                <span>Preview 26 Sections</span>
              </Button>
            </Link>

            {!isAccepted && !isExpired && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPublished ? "Re-Publish Link" : "Publish Proposal"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Status Life-cycle Banners */}
        {isAccepted && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>STATUS: ACCEPTED</span>
            </div>
            <div className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <p>Accepted By: <span className="font-semibold">{acceptanceData?.customerName || proposal.customerName}</span> ({acceptanceData?.customerEmail || proposal.customerEmail})</p>
              <p>Accepted Date & Time: <span className="font-mono font-semibold">{acceptanceData?.acceptedAt ? new Date(acceptanceData.acceptedAt).toLocaleString("en-GB") : formatUKDate(proposal.updatedAt)}</span></p>
              {acceptanceData?.notes && <p className="italic pt-1">Notes: "{acceptanceData.notes}"</p>}
            </div>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Proposal locked following client acceptance. Duplicate acceptance disabled.</span>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>STATUS: EXPIRED</span>
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              This proposal link has expired. Historical system specifications and pricing remain archived safely.
            </p>
          </div>
        )}

        {(isPublished || isAccepted) && (
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">PUBLIC CUSTOMER LINK</span>
              <span className="text-[11px] text-emerald-400 font-mono">Secure Tokenized URL</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Customer Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Does not expose internal database UUIDs or administrative file paths.
            </p>
          </div>
        )}

        {/* System & Financial Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs">
              <Sun className="w-4 h-4 fill-amber-500" />
              <span>Solar System Capacity</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">5.76 kWp</p>
            <p className="text-xs text-slate-500">12 × LONGi 480W Panels</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
              <Battery className="w-4 h-4 text-emerald-600" />
              <span>Storage & Inverter</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">9.4 kWh</p>
            <p className="text-xs text-slate-500">Hanchu ESS Hybrid Storage</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-sky-600 font-semibold text-xs">
              <DollarSign className="w-4 h-4 text-sky-600" />
              <span>Quoted Investment</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">£10,950</p>
            <p className="text-xs text-slate-500">Est. Year 1 Savings: £858</p>
          </div>
        </div>
      </div>
    </div>
  );
}
