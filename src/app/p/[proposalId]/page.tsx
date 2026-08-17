import React from "react";
import { getInteractiveProposal, acceptInteractiveProposal } from "@/lib/repositories/interactiveProposalRepository";
import { InteractiveProposalView } from "@/components/proposal/InteractiveProposalView";
import { notFound } from "next/navigation";

export default async function PublicTokenProposalPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  const proposal = await getInteractiveProposal(proposalId);

  if (!proposal) {
    notFound();
  }

  const handleAccept = async (signerName: string, signerEmail: string, notes?: string) => {
    "use server";
    return await acceptInteractiveProposal(proposalId, signerName, signerEmail, notes);
  };

  return <InteractiveProposalView proposal={proposal} onAccept={handleAccept} />;
}
