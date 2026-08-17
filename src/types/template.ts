export interface ProposalTemplate {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
