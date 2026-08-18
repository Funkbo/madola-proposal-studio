import { BlockProposal } from "@/types/block-proposal";
import { calculateProposalTotals } from "@/lib/block-defaults";

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  get: (proposal: BlockProposal) => string;
}

const fmtGBP = (n: number) => `£${n.toLocaleString("en-GB")}`;

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: "customerName",
    label: "Customer Name",
    description: "Full customer name extracted from the uploaded proposal.",
    get: (p) => p.customer?.name || "",
  },
  {
    key: "customerEmail",
    label: "Customer Email",
    description: "Customer email address.",
    get: (p) => p.customer?.email || "",
  },
  {
    key: "customerPhone",
    label: "Customer Phone",
    description: "Customer phone number.",
    get: (p) => p.customer?.phone || "",
  },
  {
    key: "customerAddress",
    label: "Customer Address",
    description: "Customer property address.",
    get: (p) => p.customer?.address || "",
  },
  {
    key: "customerPostcode",
    label: "Customer Postcode",
    description: "Customer postcode.",
    get: (p) => p.customer?.postcode || "",
  },
  {
    key: "proposalReference",
    label: "Proposal Reference",
    description: "Unique proposal reference code.",
    get: (p) => p.reference || "",
  },
  {
    key: "systemSizeKw",
    label: "System Size (kW)",
    description: "Total solar system size in kilowatts.",
    get: (p) => p.systemSizeKw || "5.4",
  },
  {
    key: "panelCount",
    label: "Panel Count",
    description: "Number of solar panels in the system.",
    get: (p) => String(p.panelCount || 12),
  },
  {
    key: "panelWattage",
    label: "Panel Wattage (W)",
    description: "Individual panel wattage.",
    get: (p) => String(p.panelWattage || 450),
  },
  {
    key: "batteryCapacity",
    label: "Battery Capacity (kWh)",
    description: "Battery storage capacity.",
    get: (p) => String(p.batteryCapacity || 9.4),
  },
  {
    key: "basePrice",
    label: "Base System Price",
    description: "Base price of the solar system before extras.",
    get: (p) => fmtGBP(calculateProposalTotals(p).basePrice),
  },
  {
    key: "finalTotal",
    label: "Final Total",
    description: "Full turnkey total including extras and EV charger.",
    get: (p) => fmtGBP(calculateProposalTotals(p).finalTotal),
  },
  {
    key: "depositAmount",
    label: "Deposit Amount (25%)",
    description: "Upfront deposit amount from the payment schedule.",
    get: (p) => fmtGBP(calculateProposalTotals(p).depositAmount),
  },
  {
    key: "balanceAmount",
    label: "Balance Amount (75%)",
    description: "Final balance due upon commissioning.",
    get: (p) => fmtGBP(calculateProposalTotals(p).balanceAmount),
  },
  {
    key: "annualSavings",
    label: "Annual Savings",
    description: "Estimated first-year energy savings.",
    get: (p) => fmtGBP(calculateProposalTotals(p).annualSavings),
  },
  {
    key: "paybackYears",
    label: "Payback Period (years)",
    description: "Estimated years to break even.",
    get: (p) => calculateProposalTotals(p).paybackYears,
  },
  {
    key: "annualGenerationKwh",
    label: "Annual Generation (kWh)",
    description: "Estimated annual system generation.",
    get: (p) => String(calculateProposalTotals(p).annualGenerationKwh),
  },
  {
    key: "preparedByName",
    label: "Advisor Name",
    description: "Name of the advisor who prepared the proposal.",
    get: (p) => p.preparedBy?.name || "",
  },
  {
    key: "preparedByEmail",
    label: "Advisor Email",
    description: "Advisor contact email.",
    get: (p) => p.preparedBy?.email || "",
  },
  {
    key: "preparedByPhone",
    label: "Advisor Phone",
    description: "Advisor contact phone.",
    get: (p) => p.preparedBy?.phone || "",
  },
];

export function getTemplateVariableValues(proposal: BlockProposal): Record<string, string> {
  const values: Record<string, string> = {};
  for (const v of TEMPLATE_VARIABLES) {
    values[v.key] = v.get(proposal);
  }
  return values;
}

/**
 * Replaces {{variable}} placeholders (and legacy [Customer Name])
 * with values from the proposal. Leaves unknown placeholders untouched.
 */
export function resolveTemplateVariables(text: string, proposal: BlockProposal): string {
  if (!text) return text;

  const values = getTemplateVariableValues(proposal);
  let resolved = text;
  for (const [key, value] of Object.entries(values)) {
    resolved = resolved.split(`{{${key}}}`).join(value);
  }
  resolved = resolved.split("[Customer Name]").join(values.customerName || "[Customer Name]");

  return resolved;
}

/**
 * Deep-resolves all {{variable}} placeholders in a block's data object
 * (strings inside arrays and nested objects are resolved too).
 */
export function resolveBlockData(data: unknown, proposal: BlockProposal): unknown {
  if (typeof data === "string") return resolveTemplateVariables(data, proposal);
  if (Array.isArray(data)) return data.map((item) => resolveBlockData(item, proposal));
  if (data && typeof data === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      out[key] = resolveBlockData((data as Record<string, unknown>)[key], proposal);
    }
    return out;
  }
  return data;
}
