import React from "react";
import { getProposalKpis, getProposals } from "@/lib/services/proposals";
import { getCustomers } from "@/lib/services/customers";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { RecentProposals } from "@/components/dashboard/RecentProposals";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [kpis, recentProposals] = await Promise.all([
    getProposalKpis(),
    getProposals(5),
    getCustomers(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Executive Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of Madola Proposal Studio proposals, leads, and conversion metrics.
        </p>
      </div>

      <KpiGrid kpis={kpis} />
      <RecentProposals proposals={recentProposals} />
    </div>
  );
}
