import { Proposal, ProposalKpis } from "@/types/proposal";

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop-1",
    reference: "MAD-2026-00001",
    customerId: "cust-1",
    customerName: "Amanda Ratucoko",
    customerEmail: "amanda.r@example.co.uk",
    createdBy: "user-1",
    status: "draft",
    createdAt: "2026-08-08",
    updatedAt: "2026-08-08",
  },
  {
    id: "prop-2",
    reference: "MAD-2026-00002",
    customerId: "cust-2",
    customerName: "James Harrison",
    customerEmail: "j.harrison@example.co.uk",
    createdBy: "user-1",
    status: "review_required",
    createdAt: "2026-08-07",
    updatedAt: "2026-08-07",
  },
  {
    id: "prop-3",
    reference: "MAD-2026-00003",
    customerId: "cust-3",
    customerName: "Eleanor Vance",
    customerEmail: "evance@example.co.uk",
    createdBy: "user-1",
    status: "approved",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05",
  },
];

export const MOCK_PROPOSAL_KPIS: ProposalKpis = {
  totalProposals: MOCK_PROPOSALS.length,
  draftCount: MOCK_PROPOSALS.filter((p) => p.status === "draft").length,
  reviewCount: MOCK_PROPOSALS.filter((p) => p.status === "review_required").length,
  approvedCount: MOCK_PROPOSALS.filter((p) => p.status === "approved").length,
};
