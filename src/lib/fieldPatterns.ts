import { ExtractionField } from "@/types/extraction";

export type FieldTransform = "none" | "int" | "float" | "lowercase" | "uppercase" | "removeSpaces";

export type FieldCategory =
  | "Customer"
  | "System"
  | "Inverter"
  | "Battery"
  | "Technical"
  | "Performance"
  | "Financial"
  | "Payment";

export interface FieldPatternConfig {
  /** ExtractionResult key this pattern populates */
  key: string;
  /** Human friendly label shown in the mapping editor */
  label: string;
  category: FieldCategory;
  type: "string" | "number";
  unit?: string;
  /** Regex source (flags are fixed to case-insensitive) */
  pattern: string;
  /** Capture group to read from the match (default 1) */
  group?: number;
  transform: FieldTransform;
  enabled: boolean;
  help?: string;
  /** Example line as it appears in a real OpenSolar PDF (shown as a hint) */
  example?: string;
  /** Literal value manually assigned by the admin (takes priority over the pattern) */
  literalOverride?: string;
}

export const FIELD_PATTERNS_STORAGE_KEY = "madola_field_patterns_v1";

export const DEFAULT_FIELD_PATTERNS: FieldPatternConfig[] = [
  // ── Customer ─────────────────────────────────────────────────────────────
  {
    key: "customerName",
    label: "Customer Name",
    category: "Customer",
    type: "string",
    pattern: "(?:Proposal for|Prepared for|Customer Name|Client Name|Customer|Client)[:\\s]+([A-Za-z0-9 \\t'-]{2,40})",
    transform: "none",
    enabled: true,
    help: "Falls back to matching 'Hi <name>' or 'Dear <name>' if the main pattern misses.",
    example: "Proposal for Amanda Ratucoko",
  },
  {
    key: "address",
    label: "Site Address",
    category: "Customer",
    type: "string",
    pattern: "(?:Site Address|Property Address|Installation Address)[:\\s]+([^\\n]{5,80})",
    transform: "none",
    enabled: true,
    help: "Falls back to matching a UK street line ending with a postcode.",
    example: "Site Address: 13 Bryn Eirlys, Bridgend",
  },
  {
    key: "postcode",
    label: "Postcode",
    category: "Customer",
    type: "string",
    pattern: "([A-Z]{1,2}[0-9][A-Z0-9]?\\s?[0-9][A-Z]{2})",
    transform: "uppercase",
    enabled: true,
    example: "CF35 6NU",
  },
  {
    key: "proposalReference",
    label: "Proposal / Quote Reference",
    category: "Customer",
    type: "string",
    pattern: "(?:Quote\\s*#?:?|Proposal\\s*(?:ID|Ref|#)?:?|Reference|Ref\\s*#?)[:\\s]*([A-Z0-9-]{4,25})",
    transform: "none",
    enabled: true,
    example: "Quote #: 10534548",
  },
  {
    key: "proposalDate",
    label: "Proposal Date",
    category: "Customer",
    type: "string",
    pattern: "(?:Date|Proposal Date)[:\\s]+([0-9]{1,2}[\\/\\s-][A-Za-z0-9]{3,9}[\\/\\s-][0-9]{2,4})",
    transform: "none",
    enabled: true,
    example: "Date: 12/06/2026",
  },
  {
    key: "validityDate",
    label: "Valid Until / Expiry",
    category: "Customer",
    type: "string",
    pattern: "(?:Valid until|Expiry Date)[:\\s]+([^\\n]{5,30})",
    transform: "none",
    enabled: true,
    example: "Valid until 12/07/2026",
  },
  {
    key: "salespersonName",
    label: "Prepared By (Name)",
    category: "Customer",
    type: "string",
    pattern: "(?:Prepared by|Salesperson|Advisor|Representative)[:\\s]+([A-Za-z\\s'-]{2,30})",
    transform: "none",
    enabled: true,
    example: "Prepared by: David Jones",
  },
  {
    key: "salespersonEmail",
    label: "Prepared By (Email)",
    category: "Customer",
    type: "string",
    pattern: "([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})",
    transform: "lowercase",
    enabled: true,
    example: "david.jones@madola.co.uk",
  },
  {
    key: "salespersonPhone",
    label: "Prepared By (Phone)",
    category: "Customer",
    type: "string",
    pattern: "(?:Phone|Tel|Mobile)[:\\s]+([0-9\\s+]{10,15})",
    transform: "removeSpaces",
    enabled: true,
    example: "Tel: +44 7700 900123",
  },

  // ── System ───────────────────────────────────────────────────────────────
  {
    key: "systemSizeKwp",
    label: "System Size (kWp)",
    category: "System",
    type: "number",
    unit: "kWp",
    pattern: "(?:System Size|System Capacity|System|Capacity)[:\\s]*([0-9]{1,2}\\.[0-9]{1,3})\\s*kWp?",
    transform: "float",
    enabled: true,
    example: "System Size: 5.76 kWp",
  },
  {
    key: "panelManufacturer",
    label: "Panel Manufacturer",
    category: "System",
    type: "string",
    pattern: "(LONGi|JA Solar|Jinko|Trina|RECOM|Canadian Solar|Qcells|Aiko|Sunpower|REC|Hyundai|Perlight)",
    transform: "none",
    enabled: true,
    example: "12 x 480 W Panels (LONGi LR7-54HVH-480M)",
  },
  {
    key: "panelModel",
    label: "Panel Model",
    category: "System",
    type: "string",
    pattern: "(LR7-[A-Za-z0-9-]+|LR5-[A-Za-z0-9-]+|JKM[A-Za-z0-9-]+|JAM[A-Za-z0-9-]+|Aiko[A-Za-z0-9-]+|RECOM[A-Za-z0-9-]+|[A-Za-z0-9-]{4,25}\\s*4[0-9]{2}W)",
    transform: "none",
    enabled: true,
  },
  {
    key: "panelQuantity",
    label: "Panel Quantity",
    category: "System",
    type: "number",
    unit: "units",
    pattern: "([0-9]{1,3})\\s*(?:x|×|\\*)\\s*([0-9]{3})\\s*W(?:att)?\\s*(?:Panels|Modules)?\\s*(?:\\(([^)]+)\\))?",
    transform: "int",
    enabled: true,
    help: "Uses the same match for panel wattage and model when possible.",
    example: "12 x 480 W Panels",
  },
  {
    key: "panelWattage",
    label: "Panel Wattage (W)",
    category: "System",
    type: "number",
    unit: "W",
    pattern: "([0-9]{3})\\s*W(?:att)?",
    transform: "int",
    enabled: true,
    example: "12 x 480 W Panels",
  },
  {
    key: "annualGenerationKwh",
    label: "Annual Generation (kWh)",
    category: "System",
    type: "number",
    unit: "kWh",
    pattern: "(?:Annual Generation|Annual Output|Expected Generation|Generation)[:\\s]*([0-9,]{3,6})\\s*kWh",
    transform: "int",
    enabled: true,
    example: "Annual Generation: 4,927 kWh",
  },

  // ── Inverter ─────────────────────────────────────────────────────────────
  {
    key: "inverterManufacturer",
    label: "Inverter Manufacturer",
    category: "Inverter",
    type: "string",
    pattern: "([0-9.]+) kW of Inverter Power\\s+([^\\n]+)\\n\\s*1 x ([A-Za-z0-9.-]+)",
    group: 2,
    transform: "none",
    enabled: true,
    help: "Reads the brand shown on the inverter product line.",
  },
  {
    key: "inverterModel",
    label: "Inverter Model",
    category: "Inverter",
    type: "string",
    pattern: "([0-9.]+) kW of Inverter Power\\s+([^\\n]+)\\n\\s*1 x ([A-Za-z0-9.-]+)",
    group: 3,
    transform: "none",
    enabled: true,
  },
  {
    key: "inverterCapacityKw",
    label: "Inverter Capacity (kW)",
    category: "Inverter",
    type: "number",
    unit: "kW",
    pattern: "([0-9.]+) kW of Inverter Power\\s+([^\\n]+)\\n\\s*1 x ([A-Za-z0-9.-]+)",
    transform: "float",
    enabled: true,
    example: "5.0 kW of Inverter Power (Hanchu ESS) 1 x HESS-HY-S-5.0K",
  },
  {
    key: "inverterWarranty",
    label: "Inverter Warranty",
    category: "Inverter",
    type: "string",
    pattern: "(?:Inverter Product Warranty|Inverter Warranty)[:\\s]*([0-9]{1,2}\\s*Years?)",
    transform: "none",
    enabled: true,
    example: "Inverter Product Warranty: 12 Years",
  },

  // ── Battery ──────────────────────────────────────────────────────────────
  {
    key: "batteryManufacturer",
    label: "Battery Manufacturer",
    category: "Battery",
    type: "string",
    pattern: "([0-9.]+) kWh of Usable Capacity\\s+([^\\n]+)\\n\\s*1 x ([A-Za-z0-9.-]+)",
    group: 2,
    transform: "none",
    enabled: true,
    help: "Reads the brand shown on the battery product line.",
  },
  {
    key: "batteryModel",
    label: "Battery Model",
    category: "Battery",
    type: "string",
    pattern: "([0-9.]+) kWh of Usable Capacity\\s+([^\\n]+)\\n\\s*1 x ([A-Za-z0-9.-]+)",
    group: 3,
    transform: "none",
    enabled: true,
  },
  {
    key: "batteryCapacityKwh",
    label: "Battery Capacity (kWh usable)",
    category: "Battery",
    type: "number",
    unit: "kWh",
    pattern: "([0-9.]+) kWh of Usable Capacity\\s+([^\\n]+)\\n\\s*1 x ([A-Za-z0-9.-]+)",
    transform: "float",
    enabled: true,
    example: "8.93 kWh of Usable Capacity (Hanchu ESS) 1 x HOME-ESS-LV-9.4K",
  },
  {
    key: "batteryWarranty",
    label: "Battery Warranty",
    category: "Battery",
    type: "string",
    pattern: "(?:Battery Product Warranty|Battery Warranty)[:\\s]*([0-9]{1,2}\\s*Years?)",
    transform: "none",
    enabled: true,
    example: "Battery Product Warranty: 12 Years",
  },

  // ── Technical & Property ─────────────────────────────────────────────────
  {
    key: "roofGroup",
    label: "Roof Group",
    category: "Technical",
    type: "string",
    pattern: "Group\\s*([0-9]+(?:\\:[^\\n]+)?)",
    transform: "none",
    enabled: true,
  },
  {
    key: "roofOrientation",
    label: "Roof Orientation",
    category: "Technical",
    type: "string",
    unit: "°",
    pattern: "Orientation:\\s*([0-9]+(?:\\s*°)?)",
    transform: "none",
    enabled: true,
  },
  {
    key: "roofPitch",
    label: "Roof Pitch / Tilt",
    category: "Technical",
    type: "string",
    unit: "°",
    pattern: "Tilt:\\s*([0-9]+(?:\\s*°)?)",
    transform: "none",
    enabled: true,
  },
  {
    key: "shadeFactor",
    label: "Shade Factor (SF)",
    category: "Technical",
    type: "number",
    pattern: "Shade Factor \\(SF\\)\\s*([0-1]\\.[0-9]{1,4})",
    transform: "float",
    enabled: true,
  },
  {
    key: "kwhPerKwp",
    label: "kWh / kWp (Kk)",
    category: "Technical",
    type: "number",
    unit: "kWh/kWp",
    pattern: "kWh\\/kWp \\(Kk\\)[^\\n]*\\s*([0-9]{3,4})",
    transform: "float",
    enabled: true,
  },

  // ── Performance ──────────────────────────────────────────────────────────
  {
    key: "annualConsumptionKwh",
    label: "Annual Consumption (kWh)",
    category: "Performance",
    type: "number",
    unit: "kWh",
    pattern: "Assumed annual electricity consumption, kWh\\s*([0-9,]{3,6})",
    transform: "int",
    enabled: true,
  },
  {
    key: "selfConsumptionPercent",
    label: "PV Self-Consumption (%)",
    category: "Performance",
    type: "number",
    unit: "%",
    pattern: "Expected solar PV self-consumption \\(PV Only\\)\\s*[0-9,]+\\s*kWh[\\s\\S]*?([0-9.]+)%",
    transform: "float",
    enabled: true,
  },
  {
    key: "selfSufficiencyPercent",
    label: "Self-Sufficiency PV Only (%)",
    category: "Performance",
    type: "number",
    unit: "%",
    pattern: "Grid electricity independence \\/ Self-su ciency \\(PV\\s*Only\\)\\s*([0-9.]+)",
    transform: "float",
    enabled: true,
  },
  {
    key: "eessSelfConsumptionKwh",
    label: "EESS Self-Consumption (kWh)",
    category: "Performance",
    type: "number",
    unit: "kWh",
    pattern: "Expected solar PV self-consumption \\(with EESS\\)\\s*([0-9,]+)",
    transform: "int",
    enabled: true,
  },
  {
    key: "eessSelfSufficiencyPercent",
    label: "Self-Sufficiency with EESS (%)",
    category: "Performance",
    type: "number",
    unit: "%",
    pattern: "Grid electricity independence \\/ Self-su ciency \\(with\\s*EESS\\)\\s*([0-9.]+)",
    transform: "float",
    enabled: true,
  },
  {
    key: "annualBatteryDischargeKwh",
    label: "Battery Discharge / Year (kWh)",
    category: "Performance",
    type: "number",
    unit: "kWh",
    pattern: "Total energy discharged per annum\\s*([0-9,]+)",
    transform: "int",
    enabled: true,
  },
  {
    key: "directToHomeKwh",
    label: "Direct to Home (kWh)",
    category: "Performance",
    type: "number",
    unit: "kWh",
    pattern: "Direct to home\\s*([0-9,]+)",
    transform: "int",
    enabled: true,
  },
  {
    key: "batteryToHomeKwh",
    label: "Battery to Home (kWh)",
    category: "Performance",
    type: "number",
    unit: "kWh",
    pattern: "Battery to home\\s*([0-9,]+)",
    transform: "int",
    enabled: true,
  },
  {
    key: "exportToGridKwh",
    label: "Export to Grid (kWh)",
    category: "Performance",
    type: "number",
    unit: "kWh",
    pattern: "Export to grid\\s*([0-9,]+)",
    transform: "int",
    enabled: true,
  },

  // ── Financial ────────────────────────────────────────────────────────────
  {
    key: "systemPricePounds",
    label: "Total System Price (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "(?:Total System Price|System Price|Total Price|Total Investment|System Cost|Total Payable|Total)[:\\s]*(?:including VAT)?[:\\s]*£?\\s*([0-9,]{4,7}(?:\\.[0-9]{2})?)",
    transform: "float",
    enabled: true,
    help: "Falls back to matching the price against the 'Total System Price' label.",
    example: "Total System Price: £10,950.00",
  },
  {
    key: "firstYearSavingsPounds",
    label: "First Year Savings (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "(?:Estimated Annual Energy Bill Savings|First Year Savings|Year 1 Savings|Annual Savings|Estimated Savings)[:\\s]*£?\\s*([0-9,]{3,6}(?:\\.[0-9]{2})?)",
    transform: "float",
    enabled: true,
    example: "Estimated Annual Energy Bill Savings: £858",
  },
  {
    key: "netSystemCostPounds",
    label: "Net System Cost (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "(?:Net System Cost|Net Cost)\\s*-?\\s*£?\\s*([0-9,]+(?:\\.[0-9]{2})?)",
    transform: "float",
    enabled: true,
  },
  {
    key: "netSavingsPounds",
    label: "Net / Lifetime Savings (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "(?:Estimated Net Savings|Net Savings|Lifetime Savings)\\s*£?\\s*([0-9,]+(?:\\.[0-9]{2})?)",
    transform: "float",
    enabled: true,
  },
  {
    key: "breakEvenYear",
    label: "Payback Period (Years)",
    category: "Financial",
    type: "number",
    unit: "Years",
    pattern: "(?:Payback|Payback Period)[:\\s]*([0-9]{1,2}(?:\\.[0-9])?)\\s*years?",
    transform: "int",
    enabled: true,
    example: "Payback Period: 11 years",
  },
  {
    key: "npvPounds",
    label: "NPV / 25-Year Savings (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "(?:Net Present Value|NPV|25 Year Savings)[:\\s]*£?\\s*([0-9,]{4,7}(?:\\.[0-9]{2})?)",
    transform: "float",
    enabled: true,
    example: "Net Present Value: £42,701",
  },
  {
    key: "roiPercent",
    label: "Total ROI (%)",
    category: "Financial",
    type: "number",
    unit: "%",
    pattern: "([0-9.]+)%\\s+Total Return on\\s+Investment",
    transform: "float",
    enabled: true,
  },
  {
    key: "roiRatePercent",
    label: "Rate of Return (%)",
    category: "Financial",
    type: "number",
    unit: "%",
    pattern: "([0-9.]+)%\\s+Rate of Return on\\s+Investment",
    transform: "float",
    enabled: true,
  },
  {
    key: "inflationRatePercent",
    label: "Inflation Rate (%)",
    category: "Financial",
    type: "number",
    unit: "%",
    pattern: "considering a ([0-9.]+)% increase in energy cost",
    transform: "float",
    enabled: true,
  },
  {
    key: "discountRatePercent",
    label: "Discount Rate (%)",
    category: "Financial",
    type: "number",
    unit: "%",
    pattern: "discount rate of ([0-9.]+)%",
    transform: "float",
    enabled: true,
  },
  {
    key: "vatPounds",
    label: "VAT (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "VAT\\s*£?\\s*([0-9,.]+)",
    transform: "float",
    enabled: true,
  },
  {
    key: "gridSavingsPounds",
    label: "Grid Savings (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "Grid Savings\\s*£?\\s*([0-9,]+)",
    transform: "float",
    enabled: true,
  },
  {
    key: "exportIncomePounds",
    label: "Export Credit (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "Export Credit\\s*£?\\s*([0-9,]+)",
    transform: "float",
    enabled: true,
  },
  {
    key: "annualBillBeforePounds",
    label: "Annual Bill Before (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "Utility Bill\\s*before new system\\s*£?\\s*([0-9,]+)",
    transform: "float",
    enabled: true,
  },
  {
    key: "annualBillAfterPounds",
    label: "Annual Bill After (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "Utility Bill\\s*after new system\\s*£?\\s*([0-9,]+)",
    transform: "float",
    enabled: true,
  },
  {
    key: "lifetime25YearSavingsPounds",
    label: "Lifetime Bill Savings (£)",
    category: "Financial",
    type: "number",
    unit: "£",
    pattern: "Lifetime Bill Savings\\s*£?\\s*([0-9,]+)",
    transform: "float",
    enabled: true,
  },

  // ── Payment ──────────────────────────────────────────────────────────────
  {
    key: "depositPercent",
    label: "Deposit (%)",
    category: "Payment",
    type: "number",
    unit: "%",
    pattern: "deposit cannot be more than ([0-9]{1,2})%",
    transform: "float",
    enabled: true,
    example: "The deposit cannot be more than 25%",
  },
];

/** Load configured patterns: localStorage override merged over defaults (SSR-safe). */
export function getFieldPatterns(): FieldPatternConfig[] {
  if (typeof window === "undefined") return DEFAULT_FIELD_PATTERNS;
  try {
    const raw = localStorage.getItem(FIELD_PATTERNS_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length > 0) {
        const byKey = new Map<string, FieldPatternConfig>();
        for (const p of saved) {
          if (p && typeof p.key === "string") byKey.set(p.key, p);
        }
        return DEFAULT_FIELD_PATTERNS.map((d) => byKey.get(d.key) || d);
      }
    }
  } catch (e) {
    console.warn("Error reading field patterns", e);
  }
  return DEFAULT_FIELD_PATTERNS;
}

export function saveFieldPatterns(patterns: FieldPatternConfig[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FIELD_PATTERNS_STORAGE_KEY, JSON.stringify(patterns));
  } catch (e) {
    console.warn("Error saving field patterns", e);
  }
}

export function resetFieldPatterns(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FIELD_PATTERNS_STORAGE_KEY);
  } catch {}
}

function toValue(raw: string, transform: FieldTransform): any {
  const trimmed = raw.trim();
  switch (transform) {
    case "int":
      return parseInt(trimmed.replace(/,/g, ""), 10);
    case "float":
      return parseFloat(trimmed.replace(/,/g, ""));
    case "lowercase":
      return trimmed.toLowerCase();
    case "uppercase":
      return trimmed.toUpperCase();
    case "removeSpaces":
      return trimmed.replace(/\s+/g, "");
    default:
      return trimmed;
  }
}

/**
 * Run the configured field patterns against PDF text.
 * Returns a map of matched fields (missing fields are simply absent).
 * Pure function - safe to use client or server side.
 */
export function applyPatternsToText(
  text: string,
  patterns: FieldPatternConfig[] = DEFAULT_FIELD_PATTERNS
): Map<string, ExtractionField<any>> {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");
  const results = new Map<string, ExtractionField<any>>();

  for (const cfg of patterns) {
    if (!cfg.enabled) continue;

    // Manual value assigned by the admin ("take this from here to here") wins.
    if (cfg.literalOverride && cfg.literalOverride.trim()) {
      const value = toValue(cfg.literalOverride, cfg.transform);
      if (value !== undefined && value !== null && value !== "" && !Number.isNaN(value)) {
        results.set(cfg.key, {
          value,
          unit: cfg.unit,
          source: "Manual mapping",
          confidence: "high",
          editable: true,
          notes: "Admin assigned value",
        });
        continue;
      }
    }

    if (!cfg.pattern) continue;
    try {
      const re = new RegExp(cfg.pattern, "i");
      const match = normalizedText.match(re);
      if (!match) continue;
      const idx = cfg.group ?? 1;
      const raw = match[idx];
      if (raw === undefined || raw === null) continue;
      if (!raw.trim()) continue;

      const value = toValue(raw, cfg.transform);
      if (value === undefined || value === null || value === "" || Number.isNaN(value)) continue;

      results.set(cfg.key, {
        value,
        unit: cfg.unit,
        source: "OpenSolar PDF",
        confidence: "high",
        editable: true,
      });
    } catch (e) {
      console.warn(`Invalid field pattern for "${cfg.key}":`, e);
    }
  }

  return results;
}