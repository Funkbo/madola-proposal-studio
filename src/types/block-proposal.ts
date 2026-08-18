export type ProposalBlockType =
  | "cover"
  | "why_choose_us"
  | "text"
  | "our_work"
  | "panel_layout"
  | "product_highlights"
  | "technical_details"
  | "performance_estimates"
  | "energy_usage"
  | "self_consumption"
  | "before_after_solar"
  | "pricing"
  | "savings"
  | "return_on_investment"
  | "whats_included"
  | "ev_charger"
  | "extra_products"
  | "next_steps"
  | "payment_schedule"
  | "final_price_summary"
  | "acceptance";

export interface ProposalBlock {
  id: string;
  type: ProposalBlockType;
  title: string;
  order: number;
  enabled: boolean;
  data: any;
  conditions?: Record<string, any>;
}

export interface ExtraProduct {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  image: string;
  included: boolean;
  isOptional: boolean;
}

export interface PaymentMilestone {
  id: string;
  label: string;
  percentage: number; // e.g. 25 for 25%
  fixedAmount?: number;
  paymentMethod: string;
  description: string;
}

export interface ProposalCustomer {
  id?: string;
  name: string;
  email: string;
  address: string;
  postcode: string;
  phone?: string;
}

export interface BlockProposal {
  id: string;
  reference: string;
  customer: ProposalCustomer;
  panelCount: number;
  panelWattage: number;
  systemSizeKw: string;
  batteryCapacity: number;
  inverterRating: number;
  basePrice: number;
  extraProducts: ExtraProduct[];
  evCharger?: ExtraProduct & { selected: boolean };
  paymentSchedule: PaymentMilestone[];
  blocks: ProposalBlock[];
  status: "draft" | "published" | "sent" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  preparedBy: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface CalculatedTotals {
  basePrice: number;
  extraProductsPrice: number;
  evChargerPrice: number;
  subtotal: number;
  vatRate: number; // e.g., 0 for 0% UK residential solar
  vatAmount: number;
  finalTotal: number;
  depositAmount: number;
  balanceAmount: number;
  annualSavings: number;
  paybackYears: string;
  annualGenerationKwh: number;
}
