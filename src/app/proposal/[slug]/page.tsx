import React from "react";
import { CustomerBlockProposalView } from "@/components/customer/CustomerBlockProposalView";
import { notFound } from "next/navigation";

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return <CustomerBlockProposalView proposalId={slug} />;
}
