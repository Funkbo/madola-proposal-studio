"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Proposal } from "@/types/proposal";
import { formatUKDate } from "@/lib/utils";
import { ArrowRight, FileText } from "lucide-react";

export interface RecentProposalsProps {
  proposals: Proposal[];
}

export function RecentProposals({ proposals }: RecentProposalsProps) {
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Proposals</CardTitle>
          <CardDescription>Latest proposals queried directly from Supabase PostgreSQL database.</CardDescription>
        </div>
        <Link href="/proposals">
          <Button variant="ghost" size="sm">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {proposals.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileText}
              title="No proposals found in database."
              description="Create your first proposal to populate the database."
              actionLabel="Create Proposal"
              onAction={() => {
                window.location.href = "/proposals/new";
              }}
            />
          </div>
        ) : (
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
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>{proposal.reference}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{proposal.customerName}</div>
                    <div className="text-xs text-slate-500">{proposal.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge status={proposal.status} />
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">{formatUKDate(proposal.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/proposals/${proposal.id}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
