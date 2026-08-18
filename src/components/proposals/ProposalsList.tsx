"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Proposal } from "@/types/proposal";
import { formatUKDate } from "@/lib/utils";
import { publishProposal } from "@/lib/repositories/proposalRepository";
import { FileText, Plus, Search, Filter, Eye, ExternalLink, Copy, Check, Link2 } from "lucide-react";

export interface ProposalsListProps {
  initialProposals: Proposal[];
}

export function ProposalsList({ initialProposals }: ProposalsListProps) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [searchTerm, setSearchTerm] = useState("");

  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filteredProposals = proposals.filter(
    (p) =>
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customerName && p.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPublicUrl = (proposal: Proposal) => `/p/${proposal.publicToken}`;

  const handlePublish = async (proposal: Proposal) => {
    setPublishingId(proposal.id);
    setPublishError(null);
    try {
      const { publicToken, publicUrl, error } = await publishProposal(proposal.id);
      if (error || !publicToken) {
        setPublishError(error || "Failed to publish proposal.");
        return;
      }
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id
            ? { ...p, publicToken, status: "published" as Proposal["status"], publishedAt: new Date().toISOString() }
            : p
        )
      );
      void publicUrl;
    } catch (e: any) {
      setPublishError(e.message || "Failed to publish proposal.");
    } finally {
      setPublishingId(null);
    }
  };

  const handleCustomerView = async (proposal: Proposal) => {
    if (!proposal.publicToken) {
      await handlePublish(proposal);
    }
    window.open(`/p/${proposal.publicToken}`, "_blank");
  };

  const handleCopyLink = async (proposal: Proposal) => {
    const url = `${window.location.origin}${getPublicUrl(proposal)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(proposal.publicToken || null);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      setCopiedToken(null);
    }
  };

  const renderActions = (proposal: Proposal) => {
    if (proposal.publicToken) {
      return (
        <div className="flex items-center justify-end gap-2">
          <Link href={getPublicUrl(proposal)} target="_blank">
            <Button variant="outline" size="sm" title="Customer View">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Customer View
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5">
            <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[160px]">
              {getPublicUrl(proposal)}
            </span>
            <button
              onClick={() => handleCopyLink(proposal)}
              className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="Copy Link"
            >
              {copiedToken === proposal.publicToken ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCustomerView(proposal)}
          disabled={publishingId === proposal.id}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Customer View
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handlePublish(proposal)}
          disabled={publishingId === proposal.id}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          {publishingId === proposal.id ? "Publishing..." : "Final Customer Publish"}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Proposals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interactive solar proposals created from OpenSolar PDF uploads.
          </p>
        </div>
        <div>
          <Link href="/proposals/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Upload PDF</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search reference or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto text-xs text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Showing {filteredProposals.length} proposal(s)</span>
        </div>
      </div>

      {publishError && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs px-4 py-3">
          {publishError}
        </div>
      )}

      {/* Main Table or Responsive Mobile Card List */}
      {filteredProposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No proposals found."
          description="Upload an OpenSolar PDF to auto-create a customer and proposal."
          actionLabel="Upload PDF"
          onAction={() => {
            window.location.href = "/proposals/new";
          }}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {proposal.reference}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{proposal.customerName}</div>
                      <div className="text-xs text-slate-500">{proposal.customerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge status={proposal.status} />
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs font-medium">{formatUKDate(proposal.createdAt)}</TableCell>
                    <TableCell>{renderActions(proposal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List (Eliminates horizontal scrolling on 375px) */}
          <div className="block sm:hidden space-y-3">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="madola-card p-4 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {proposal.reference}
                  </span>
                  <Badge status={proposal.status} />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{proposal.customerName}</h4>
                  <p className="text-xs text-slate-500 truncate">{proposal.customerEmail}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>{formatUKDate(proposal.createdAt)}</span>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {proposal.publicToken ? (
                    <>
                      <Link href={getPublicUrl(proposal)} target="_blank" className="w-full">
                        <Button variant="outline" size="sm" className="w-full min-h-[44px]">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Customer View
                        </Button>
                      </Link>
                      <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5">
                        <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300 truncate flex-1">
                          {getPublicUrl(proposal)}
                        </span>
                        <button
                          onClick={() => handleCopyLink(proposal)}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Copy Link"
                        >
                          {copiedToken === proposal.publicToken ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full min-h-[44px]"
                        onClick={() => handleCustomerView(proposal)}
                        disabled={publishingId === proposal.id}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Customer View
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full min-h-[44px]"
                        onClick={() => handlePublish(proposal)}
                        disabled={publishingId === proposal.id}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        {publishingId === proposal.id ? "Publishing..." : "Final Customer Publish"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}