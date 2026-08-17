import React from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { ProposalKpis } from "@/types/proposal";
import { FileText, Edit3, Clock, CheckCircle2 } from "lucide-react";

export interface KpiGridProps {
  kpis: ProposalKpis;
}

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Proposals"
        value={kpis.totalProposals}
        description="All proposals created in system"
        icon={FileText}
        trend={{ value: "+12% this month", positive: true }}
        accentColor="slate"
      />
      <KpiCard
        title="Draft"
        value={kpis.draftCount}
        description="In progress or pending extraction"
        icon={Edit3}
        accentColor="slate"
      />
      <KpiCard
        title="Under Review"
        value={kpis.reviewCount}
        description="Awaiting staff review & signoff"
        icon={Clock}
        accentColor="amber"
      />
      <KpiCard
        title="Approved"
        value={kpis.approvedCount}
        description="Ready for interactive customer portal"
        icon={CheckCircle2}
        trend={{ value: "+8% conversion", positive: true }}
        accentColor="emerald"
      />
    </div>
  );
}
