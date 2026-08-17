"use server";

import { createProposal } from "@/lib/services/proposals";
import { redirect } from "next/navigation";

export async function createProposalAction(formData: FormData) {
  const customerId = formData.get("customerId") as string;
  const templateId = (formData.get("templateId") as string) || undefined;

  if (!customerId) {
    return { error: "Customer selection is required." };
  }

  const { proposal, error } = await createProposal(customerId, templateId);

  if (error || !proposal) {
    return { error: error || "Failed to create proposal record." };
  }

  redirect(`/proposals/${proposal.id}`);
}

export async function deleteProposalAction(id: string) {
  const { deleteProposal } = await import("@/lib/repositories/proposalRepository");
  const res = await deleteProposal(id);
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/proposals");
  return res;
}
