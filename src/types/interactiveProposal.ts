export interface InteractiveProposalCustomer {
  name: string;
  email: string;
  phone?: string;
  address: string;
  postcode: string;
}

export interface InteractiveProposalSystem {
  systemSizeKwp: number;
  annualGenerationKwh: number;
  panelCount: number;
  panelWattage: number;
  panelManufacturer: string;
  panelModel: string;
  inverterManufacturer: string;
  inverterModel: string;
  inverterCapacityKw: number;
  inverterWarranty: string;
  batteryManufacturer: string;
  batteryModel: string;
  batteryCapacityKwh: number;
  batteryWarranty: string;
}

export interface InteractiveProposalTechnical {
  roofGroup: string;
  orientation: string;
  pitch: string;
  shadeFactor: number;
  kwhPerKwp: number;
}

export interface InteractiveProposalPerformance {
  annualConsumptionKwh: number;
  annualGenerationKwh: number;
  selfConsumptionPercent: number;
  selfSufficiencyPercent: number;
  directToHomeKwh: number;
  batteryToHomeKwh: number;
  exportToGridKwh: number;
}

export interface InteractiveProposalFinancials {
  baseSystemPrice: number;
  annualBillBefore: number;
  annualBillAfter: number;
  firstYearSavings: number;
  gridSavings: number;
  exportIncome: number;
  vatRatePercent: number;
  roiPercent: number;
  breakEvenYear: number;
  lifetime25YearSavings: number;
  inflationRatePercent: number;
}

export interface InteractiveProposalProductItem {
  id: string;
  category: "principal" | "ancillary" | "optional" | "ev" | "additional";
  name: string;
  manufacturer: string;
  model: string;
  quantity: number;
  price: number;
  included: boolean;
  description?: string;
  image?: string;
  warranty?: string;
}

export interface InteractivePaymentMilestone {
  id: string;
  label: string;
  percentage: number;
  amount: number;
  paymentMethod: string;
  description?: string;
  orderIndex: number;
}

export interface InteractiveProposalAcceptance {
  status: "pending" | "accepted" | "declined";
  acceptedAt?: string;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
}

export type ProposalImageSource = "template" | "custom" | "extracted";

export interface InteractiveProposalBranding {
  companyName: string;
  logoReference?: string;
  primaryColor: string;
  secondaryColor: string;
  email: string;
  phone: string;
  website: string;
  address: string;
}

export interface FullInteractiveProposalData {
  id: string;
  reference: string;
  publicSlug: string;
  publicToken: string;
  status: "draft" | "published" | "accepted" | "expired";
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;

  customer: InteractiveProposalCustomer;
  system: InteractiveProposalSystem;
  technical: InteractiveProposalTechnical;
  performance: InteractiveProposalPerformance;
  financials: InteractiveProposalFinancials;
  monthlyData: Array<{
    month: string;
    generationKwh: number;
    consumptionKwh: number;
    importKwh: number;
    exportKwh: number;
    exportCreditPounds: number;
    billBeforePounds: number;
    billAfterPounds: number;
    savingsPounds: number;
  }>;
  products: InteractiveProposalProductItem[];
  milestones: InteractivePaymentMilestone[];
  acceptance: InteractiveProposalAcceptance;
  branding: InteractiveProposalBranding;
  heroImage?: string;
  layoutImage?: string;
  heroSource?: ProposalImageSource;
  layoutSource?: ProposalImageSource;
  preparedBy?: {
    name?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
  };
  galleryImages?: string[];
  sourceDocument?: {
    fileName: string;
    storageBucket: string;
    storagePath: string;
    fileSize: number;
    mimeType: string;
  };
}
