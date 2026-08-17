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
import { deleteProposalAction } from "@/app/proposals/actions";
import { deleteLocalProposalStorage } from "@/lib/repositories/proposalRepository";
import { FileText, Plus, Search, Filter, Eye, Trash2, ExternalLink, AlertTriangle } from "lucide-react";

export interface ProposalsListProps {
  initialProposals: Proposal[];
}

export function ProposalsList({ initialProposals }: ProposalsListProps) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [searchTerm, setSearchTerm] = useState("");

  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProposals = proposals.filter(
    (p) =>
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customerName && p.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteConfirm = async () => {
    if (!proposalToDelete) return;
    setIsDeleting(true);
    try {
      const targetId = proposalToDelete.id;
      deleteLocalProposalStorage(targetId);
      if (proposalToDelete.reference) deleteLocalProposalStorage(proposalToDelete.reference);
      if (proposalToDelete.publicToken) deleteLocalProposalStorage(proposalToDelete.publicToken);

      await deleteProposalAction(targetId);
      setProposals((prev) =>
        prev.filter((p) => p.id !== targetId && p.reference !== proposalToDelete.reference)
      );
      setProposalToDelete(null);
    } catch (err) {
      console.error("Failed to delete proposal", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Proposals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Database of interactive solar proposals and client approvals.
          </p>
        </div>
        <div>
          <Link href="/proposals/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Create Proposal</span>
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

      {/* Main Table or Empty State */}
      {filteredProposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No proposals found."
          description="Create your first proposal to populate the database records."
          actionLabel="Create Proposal"
          onAction={() => {
            window.location.href = "/proposals/new";
          }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {proposal.reference}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{proposal.customerName}</div>
                  <div className="text-xs text-slate-500">{proposal.customerEmail}</div>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                  {proposal.templateName || "Default Solar Template"}
                </TableCell>
                <TableCell>
                  <Badge status={proposal.status} />
                </TableCell>
                <TableCell className="text-slate-500 text-xs">{formatUKDate(proposal.createdAt)}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-2">
                  {proposal.publicToken && (
                    <Link href={`/p/${proposal.publicToken}`} target="_blank">
                      <Button variant="ghost" size="sm" title="Preview Public Proposal">
                        <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/proposals/${proposal.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>
                  </Link>
                  <button
                    onClick={() => setProposalToDelete(proposal)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete Proposal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Delete Proposal Modal */}
      {proposalToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Delete Proposal Record?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete proposal <strong>"{proposalToDelete.reference}"</strong> for customer <strong>"{proposalToDelete.customerName}"</strong> from the database?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProposalToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                <span>{isDeleting ? "Deleting..." : "Delete Proposal"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
