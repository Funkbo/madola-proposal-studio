import {
  getProposals as repoGetProposals,
  getProposalsLegacy as repoGetProposalsLegacy,
  getProposalById as repoGetProposalById,
  createProposal as repoCreateProposal,
  getProposalKpis as repoGetProposalKpis,
} from "@/lib/repositories/proposalRepository";
import { Proposal, ProposalKpis } from "@/types/proposal";

export async function getProposalKpis(): Promise<ProposalKpis> {
  return repoGetProposalKpis();
}

export async function getProposals(limit?: number): Promise<Proposal[]> {
  return repoGetProposalsLegacy(limit);
}

export async function getProposalsPaginated(limit?: number, offset?: number): Promise<{ data: Proposal[]; total: number; hasMore: boolean }> {
  const { getProposals } = await import("@/lib/repositories/proposalRepository");
  return getProposals({ limit, offset });
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  return repoGetProposalById(id);
}

export async function getProposalsByCustomerId(customerId: string): Promise<Proposal[]> {
  const { getProposalsByCustomerId: repoGetProposalsByCustomerId } = await import("@/lib/repositories/proposalRepository");
  return repoGetProposalsByCustomerId(customerId);
}

export async function createProposal(
  customerId: string,
  templateId?: string
): Promise<{ proposal: Proposal | null; error: string | null }> {
  return repoCreateProposal(customerId, templateId);
}
