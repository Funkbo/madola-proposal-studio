import React from "react";
import { CustomerBlockProposalView } from "@/components/customer/CustomerBlockProposalView";
import { notFound } from "next/navigation";

export default async function PublicTokenProposalPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;

  if (!proposalId) {
    notFound();
  }

  return <CustomerBlockProposalView proposalId={proposalId} />;
}
