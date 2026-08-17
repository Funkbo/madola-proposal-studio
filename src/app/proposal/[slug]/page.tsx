import React from "react";
import { getInteractiveProposal, acceptInteractiveProposal } from "@/lib/repositories/interactiveProposalRepository";
import { InteractiveProposalView } from "@/components/proposal/InteractiveProposalView";
import { notFound } from "next/navigation";

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proposal = await getInteractiveProposal(slug);

  if (!proposal) {
    notFound();
  }

  const handleAccept = async (signerName: string, signerEmail: string, notes?: string) => {
    "use server";
    return await acceptInteractiveProposal(slug, signerName, signerEmail, notes);
  };

  return <InteractiveProposalView proposal={proposal} onAccept={handleAccept} />;
}
