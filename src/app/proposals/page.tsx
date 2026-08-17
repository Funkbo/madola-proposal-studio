import React from "react";
import { ProposalsList } from "@/components/proposals/ProposalsList";
import { getProposals } from "@/lib/services/proposals";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const proposals = await getProposals();
  return <ProposalsList initialProposals={proposals} />;
}
