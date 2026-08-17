export type ProposalStatus = "draft" | "review_required" | "approved" | "published" | "sent" | "accepted" | "rejected" | "expired";

export interface Proposal {
  id: string;
  reference: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  createdBy: string;
  status: ProposalStatus;
  templateId?: string | null;
  templateName?: string | null;
  expiresAt?: string | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
  publicToken?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalKpis {
  totalProposals: number;
  draftCount: number;
  reviewCount: number;
  approvedCount: number;
}
