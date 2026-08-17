export type ConfidenceLevel = "high" | "medium" | "low";

export interface ExtractionField<T = any> {
  value: T;
  unit?: string;
  source: string;
  confidence: ConfidenceLevel;
  editable: boolean;
  notes?: string;
  adminAdjusted?: boolean;
}

export interface ExtractedMonthlyRow {
  month: string;
  generationKwh: number;
  consumptionKwh: number;
  importKwh: number;
  exportKwh: number;
  exportCreditPounds: number;
  billBeforePounds: number;
  billAfterPounds: number;
  savingsPounds: number;
}

export interface ExtractedProductItem {
  category: "principal" | "ancillary" | "optional" | "ev";
  name: string;
  manufacturer: string;
  model: string;
  quantity: number;
  unitPrice: number;
  included: boolean;
  description?: string;
  image?: string;
  warranty?: string;
}

export interface NormalisedProposalData {
  customer: {
    customerName: string;
    address: string;
    postcode: string;
    proposalReference: string;
    proposalDate: string;
    validityDate: string;
    preparedByName: string;
    preparedByEmail: string;
    preparedByPhone: string;
  };
  property: {
    roofOrientation: string;
    roofPitch: string;
    shadeFactor: number;
    kwhPerKwp: number;
  };
  system: {
    systemSizeKwp: number;
    panelManufacturer: string;
    panelModel: string;
    panelQuantity: number;
    panelWattage: number;
    annualGenerationKwh: number;
    inverterManufacturer: string;
    inverterModel: string;
    inverterCapacityKw: number;
    inverterWarranty: string;
    batteryManufacturer: string;
    batteryModel: string;
    batteryCapacityKwh: number;
    batteryWarranty: string;
  };
  performance: {
    annualConsumptionKwh: number;
    pvSelfConsumptionKwh: number;
    pvSelfSufficiencyPercent: number;
    eessSelfConsumptionKwh: number;
    eessSelfSufficiencyPercent: number;
    annualBatteryDischargeKwh: number;
  };
  monthlyEnergy: ExtractedMonthlyRow[];
  financial: {
    firstYearSavingsPounds: number;
    lifetimeSavingsPounds: number;
    systemPricePounds: number;
    vatPounds: number;
    totalPricePounds: number;
    netSystemCostPounds: number;
    netSavingsPounds: number;
    paybackYears: number;
    npvPounds: number;
    roiPercent: number;
    roiRatePercent: number;
    inflationRatePercent: number;
    discountRatePercent: number;
  };
  products: ExtractedProductItem[];
  payments: {
    depositPercent: number;
    depositAmountPounds: number;
    balanceAmountPounds: number;
  };
  sourceDocument?: {
    fileName: string;
    storageBucket: string;
    storagePath: string;
    fileSize: number;
    mimeType: string;
  };
  roofLayoutImage?: string;
}

export interface ExtractedSystemOption {
  optionNumber: number;
  optionName: string;
  isRecommended?: boolean;
  systemSizeKwp: ExtractionField<number>;
  annualGenerationKwh: ExtractionField<number>;
  panelQuantity: ExtractionField<number>;
  panelWattage: ExtractionField<number>;
  panelManufacturer: ExtractionField<string>;
  panelModel: ExtractionField<string>;
  inverterManufacturer: ExtractionField<string>;
  inverterModel: ExtractionField<string>;
  inverterCapacityKw: ExtractionField<number>;
  batteryManufacturer: ExtractionField<string>;
  batteryModel: ExtractionField<string>;
  batteryCapacityKwh: ExtractionField<number>;
  systemPricePounds: ExtractionField<number>;
  firstYearSavingsPounds: ExtractionField<number>;
  npvPounds: ExtractionField<number>;
  roiPercent: ExtractionField<number>;
  products: ExtractedProductItem[];
}

export interface ExtractionResult {
  // Customer Details
  customerName: ExtractionField<string>;
  address: ExtractionField<string>;
  postcode: ExtractionField<string>;
  proposalReference: ExtractionField<string>;
  proposalDate: ExtractionField<string>;
  validityDate: ExtractionField<string>;
  salespersonName: ExtractionField<string>;
  salespersonEmail: ExtractionField<string>;
  salespersonPhone: ExtractionField<string>;

  // System Details
  systemSizeKwp: ExtractionField<number>;
  panelManufacturer: ExtractionField<string>;
  panelModel: ExtractionField<string>;
  panelWattage: ExtractionField<number>;
  panelQuantity: ExtractionField<number>;
  annualGenerationKwh: ExtractionField<number>;

  // Inverter & Battery Specs
  inverterManufacturer: ExtractionField<string>;
  inverterModel: ExtractionField<string>;
  inverterCapacityKw: ExtractionField<number>;
  inverterWarranty: ExtractionField<string>;

  batteryManufacturer: ExtractionField<string>;
  batteryModel: ExtractionField<string>;
  batteryCapacityKwh: ExtractionField<number>;
  batteryWarranty: ExtractionField<string>;

  // Technical & Property
  roofGroup: ExtractionField<string>;
  roofOrientation: ExtractionField<string>;
  roofPitch: ExtractionField<string>;
  shadeFactor: ExtractionField<number>;
  kwhPerKwp: ExtractionField<number>;

  // Performance
  annualConsumptionKwh: ExtractionField<number>;
  selfConsumptionPercent: ExtractionField<number>;
  selfSufficiencyPercent: ExtractionField<number>;
  eessSelfConsumptionKwh: ExtractionField<number>;
  eessSelfSufficiencyPercent: ExtractionField<number>;
  annualBatteryDischargeKwh: ExtractionField<number>;
  directToHomeKwh: ExtractionField<number>;
  batteryToHomeKwh: ExtractionField<number>;
  exportToGridKwh: ExtractionField<number>;

  // Financials
  annualBillBeforePounds: ExtractionField<number>;
  annualBillAfterPounds: ExtractionField<number>;
  firstYearSavingsPounds: ExtractionField<number>;
  gridSavingsPounds: ExtractionField<number>;
  exportIncomePounds: ExtractionField<number>;
  systemPricePounds: ExtractionField<number>;
  vatPounds: ExtractionField<number>;
  totalPricePounds: ExtractionField<number>;
  netSystemCostPounds: ExtractionField<number>;
  netSavingsPounds: ExtractionField<number>;
  roiPercent: ExtractionField<number>;
  roiRatePercent: ExtractionField<number>;
  breakEvenYear: ExtractionField<number>;
  npvPounds: ExtractionField<number>;
  lifetime25YearSavingsPounds: ExtractionField<number>;
  inflationRatePercent: ExtractionField<number>;
  discountRatePercent: ExtractionField<number>;

  // Payments
  depositPercent: ExtractionField<number>;

  // Tables & Collections
  monthlyData: ExtractedMonthlyRow[];
  products: ExtractedProductItem[];

  // Multi-System Options
  systemOptions?: ExtractedSystemOption[];
  selectedOptionIndex?: number;

  // Extraction Status
  heroImage?: string;
  roofLayoutImage?: string;
  allExtractedImages?: string[];
  status: "success" | "needs_review";
  extractedAt: string;
  rawText?: string;
  normalised?: NormalisedProposalData;
}
