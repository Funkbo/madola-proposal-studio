import React from "react";
import { getProposalById } from "@/lib/services/proposals";
import { ProposalDetailView } from "@/components/proposals/ProposalDetailView";
import { notFound } from "next/navigation";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { ConfigErrorBanner } from "@/components/ui/ConfigErrorBanner";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";

export const dynamic = "force-dynamic";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return <ConfigErrorBanner />;
  }

  const { id } = await params;
  const proposal = await getProposalById(id);

  if (!proposal) {
    notFound();
  }

  let acceptanceData = null;
  try {
    const supabase = await getSupabaseClient();
    const { data } = await supabase
      .from("proposal_acceptance")
      .select("*")
      .eq("proposal_id", proposal.id)
      .maybeSingle();

    if (data) {
      acceptanceData = {
        acceptedAt: data.accepted_at,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        notes: data.notes,
      };
    }
  } catch (e) {
    console.warn("Could not query proposal_acceptance row", e);
  }

  return <ProposalDetailView proposal={proposal} acceptanceData={acceptanceData} />;
}
